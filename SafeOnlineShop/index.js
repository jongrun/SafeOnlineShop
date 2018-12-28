const express = require('express');
const path = require('path');
const Web3 = require('web3');
const ejs = require('ejs');
const bodyParser = require('body-parser');
const fs = require('fs');
const solc = require('solc');
const app = express();
app.set('view engine', 'ejs');

let urlencodedParser = bodyParser.urlencoded({ extended: false })


// 创建一个web3的实例，设置一个provider
if (typeof web3 !== 'undefined') {
    web3 = new Web3(web3.currentProvider);
} else {
    // set the provider from Web3.providers
    web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
}
console.log("gasPrice: ", web3.eth.gasPrice.toString(10));


// 编译合约并获取abi和bytecode
let source = {
    language: 'Solidity',
    sources: {
        'test.sol': {
            content: fs.readFileSync('./contract/SafeOnlineShop.sol', 'utf8')
        }
    },
    settings: {
        outputSelection: {
            '*': {
                '*': ['*']
            }
        }
    }
}
let compiledContract = JSON.parse(solc.compile(JSON.stringify(source)));
let abi = compiledContract.contracts['test.sol']['SafeOnlineShop'].abi;
let bytecode = '0x' + compiledContract.contracts['test.sol']['SafeOnlineShop']['evm']['bytecode']['object'];

// 测试用户
let acc0 = web3.eth.accounts[0];
let acc1 = web3.eth.accounts[1];
let acc2 = web3.eth.accounts[2];
let acc3 = web3.eth.accounts[3];

let account; // 当前用户的账户地址
let shopAddress; // 当前商店的合约地址
let SafeonlineshopContract = web3.eth.contract(abi);


app.use(express.static(__dirname + '/views'));

// app.get('/', function (req, res) {
// 	res.sendFile(path.join(__dirname, "/views/index.html"));
// });

// 进入个人主页
app.get('/home', function(req, res){
	account = req.query.address;
	console.log("account: ", account);
	let balance = web3.fromWei(web3.eth.getBalance(account));
	return res.render(path.join(__dirname, "/views/home"), {address: account, balance: balance, blocks: web3.eth.blockNumber});
});

// 进入商店
app.get('/shop', function(req, res){
	shopAddress = req.query.address;
	balance = web3.eth.getBalance(shopAddress);
	safeonlineshop = SafeonlineshopContract.at(shopAddress);
	let seller = safeonlineshop.seller();

	console.log("shop: ", shopAddress);
	console.log("seller: " + seller);

	// 查看该商店的商品
	let products = [];

	for( let i = 0; i < safeonlineshop.productsCount(); i++){
		let product = safeonlineshop.products(i);
		// console.log("product id: " + product[0].toString());
		// console.log("description: " + product[3].toString());
		// console.log("price: " + product[1].toString());
		// console.log("stock: " + product[2].toString());
		products.push({"id": product[0].toNumber(),
					"description": product[3].toString(),
					"price": product[1].toNumber(),
					"stock": product[2].toNumber()});
	}
	return res.render(path.join(__dirname, "/views/shop"), 
		{shopAddress: shopAddress, seller: seller, balance: balance, account: account, products: products});
});

// 开店
app.get('/openShop', function(req, res){

	// 部署合约
	const safeonlineshopContractInstance = SafeonlineshopContract.new({
	    data: bytecode, 
	    from: account,
	    gas: 10000000000
	}, function(err, myContract){
	    if(err){
	        console.log(err);
	        return res.send("Maybe Error: authentication needed: password or unlock");
	    }
	    else if(myContract.address){
	        console.log('deploy successfully, you shop contract address is: ', myContract.address);
	        res.redirect('/shop?address=' + myContract.address); // 进入商店页面
	    }else{
	    	console.log("deploy transaction hash:" + myContract.transactionHash + "\nPlease waiting...");
	    }
	});
});

// 商家进入增加商品界面
app.get('/addNewProduct', function(req, res){
	return res.sendFile(path.join(__dirname, "/views/addNewProduct.html"));
});

// 商家进入设置库存界面
app.get('/setStock', function(req, res){
	return res.render(path.join(__dirname, "/views/setStock"), {productId: req.query.productId});
});

// 买家进入下订单界面
app.get('/placeOrder', function(req, res){
	return res.render(path.join(__dirname, "/views/placeOrder"), {productId: req.query.productId});
});

// 买家进入确认收货界面
app.get('/confirmReceived', function(req, res){
	return res.sendFile(path.join(__dirname, "/views/confirmReceived.html"));
});

// 在首页登录，进入个人主页
app.post('/', urlencodedParser, function(req, res){
	if(web3.isAddress(req.body.address)){ // 检查是否为合法地址
		return res.redirect('/home?address=' + req.body.address);
	} else {
		return res.send('Please enter a valid address');
	}
});

// 在个人主页提交商店地址，进入商店页面
app.post('/home', urlencodedParser, function(req, res){
	return res.redirect('/shop?address=' + req.body.address);
});

// 商家提交增加新产品的表单
app.post('/addNewProduct', urlencodedParser, function(req, res){

	safeonlineshop = SafeonlineshopContract.at(shopAddress);

	// 增加新商品
	if(account != undefined && account == safeonlineshop.seller()){

		let amount = req.body.amount;
		let price = req.body.price;
		let description = req.body.description;
		let value = amount * price * 2; // 保证金
		if(web3.eth.getBalance(account) > value){ // 判断余额是否足够
			// 监听AddNewProductOK
			let flag = false; // flag，防止回调函数被调用两次
			let addNewProductOK = safeonlineshop.AddNewProductOK(function(err, result){
				if(flag) return;
				else flag = true;
				addNewProductOK.stopWatching();
				if (err) {
					console.log("err: ", err);
				} else {
					console.log("add new product result: ", result);
					res.redirect('/shop?address=' + shopAddress);
				}
			});

			// 调用addNewProduct
			safeonlineshop.addNewProduct.sendTransaction(amount, price, description, {
			    from: account, 
			    value: value,
			    gas: 9999999999
			}, function(err, address){
			    if(err){
			        console.log(err);
			        return res.send("Maybe Error: authentication needed: password or unlock");
			    }
			    else{
			    	console.log("tx Hash: " + address);
			    }
			});
		} else {
			return res.send('Your balance is not enough.');
		}
	} else {
		return res.send('You are not the seller of the shop or the account is undefined.');
	}

});

// 商家提交设置库存的表单
app.post('/setStock', urlencodedParser, function(req, res){
	//设置已有商品库存
	if(account != undefined && account == safeonlineshop.seller()){
		safeonlineshop = SafeonlineshopContract.at(shopAddress);

		let productId = req.body.productId;
		let newStock = req.body.newStock;
		let value = 0;
		let price = safeonlineshop.products(productId)[1].toNumber();
		let oldStock = safeonlineshop.products(productId)[2].toNumber();

		// 若增加库存，则要发送保证金
		if(newStock > oldStock){
			value = (newStock - oldStock) * price * 2;
		}

		if(newStock == oldStock){ // 若库存没变，则直接返回商店页面
			return res.redirect('/shop?address=' + shopAddress);
		} else if (web3.eth.getBalance(account) > value){ // 判断余额是否足够

			// 监听StockSet
			let flag = false; // flag，防止回调函数被调用两次
			let stockSet = safeonlineshop.StockSet(function(err, result){
				if(flag) return;
				else flag = true;
				stockSet.stopWatching();
				if (err) {
					console.log("err: ", err);
				} else {
					console.log("set stock result: ", result);
					return res.redirect('/shop?address=' + shopAddress);
				}
			});

			// 调用setStock
			safeonlineshop.setStock.sendTransaction(productId, newStock, {
			    from: account,
			    value: value,
			    gas: 9999999999999
			}, function(err, address){
			    if(err){
			        console.log(err);
			        return res.send("Maybe Error: Exceeds block gas limit");
			    }
			    console.log("tx Hash: " + address);
			});
		} else {
			return res.send('Your balance is not enough.');
		}
	} else {
		return res.send('You are not the seller of the shop or the account is undefined.')
	}
});

// 买家提交下订单的表单
app.post('/placeOrder', urlencodedParser, function(req, res){
	safeonlineshop = SafeonlineshopContract.at(shopAddress);

	// 买家下达订单
	if(account != undefined){

		let productId = req.body.productId;
		let amount = req.body.amount;
		let price = parseInt(safeonlineshop.products(productId)[1].toString());
		let value = amount * price * 2;

		if(web3.eth.getBalance(account) > value){ // 判断余额是否足够

			// 监听OrderPlaced
			let flag = false; // flag，防止回调函数被调用两次
			let orderPlaced = safeonlineshop.OrderPlaced();
			orderPlaced.watch(function(err, result){
				if(flag) return;
				else flag = true;
				orderPlaced.stopWatching();
				if (err) {
					console.log("err: ", err);
				} else {
					console.log("result: ", result.args.goodsId);
					return res.send(result);
				}
			});

			// 调用placeOrder
			safeonlineshop.placeOrder.sendTransaction(productId, amount, {
			    from: account,
			    gas: 1000000000000,
			    value: value
			}, function(err, address){
			    if(err){
			        console.log(err);
			        return res.send("Maybe Error: Exceeds block gas limit");
			    }
			    console.log("tx Hash: " + address);
			});	
		} else {
			return res.send('Your balance is not enough.');
		}

	} else {
		return res.send('The account is undefined!')
	}
});

// 买家提交确认收货的表单
app.post('/confirmReceived', urlencodedParser, function(req, res){
	safeonlineshop = SafeonlineshopContract.at(shopAddress);

	// 买家确认收货
	if(account != undefined){

		let goodsId = req.body.goodsId;

		// 监听ConfirmReceived
		let flag = false; // flag，防止回调函数被调用两次
		let confirmReceived = safeonlineshop.ConfirmReceived(function(err, result){
			if (flag) return;
			else flag = true;
			confirmReceived.stopWatching();
			if(err){
				console.log("confirmReceived err: ", err);
			} else {
				/*console.log("confirmReceived result: ", result);
				console.log("shop: ", shopAddress);
				console.log("goodId: ", safeonlineshop.allGoods(goodsId)[1]);
				console.log("productId: ", safeonlineshop.allGoods(goodsId)[0]);
				console.log("buyer: ", safeonlineshop.allGoods(goodsId)[2]);
				console.log("seller: ", safeonlineshop.allGoods(goodsId)[3]);
				console.log("state: ", safeonlineshop.allGoods(goodsId)[4], "{0:OnSale, 1:Ordered, 2:Delivering, 3:Sold, 4:Invalid}");*/
				return res.send("Confirm successfully!\n" +
					"shop: " + shopAddress + "\n" + 
					"goodId: " + safeonlineshop.allGoods(goodsId)[1] + "\n" + 
					"productId: " + safeonlineshop.allGoods(goodsId)[0] + "\n" + 
					"buyer: " + safeonlineshop.allGoods(goodsId)[2] + "\n" +
					"seller: " + safeonlineshop.allGoods(goodsId)[3] + "\n" +
					"state: " + safeonlineshop.allGoods(goodsId)[4] + " {0:OnSale, 1:Ordered, 2:Delivering, 3:Sold, 4:Invalid}");
			}
		});

		// 调用confirmReceived
		safeonlineshop.confirmReceived.sendTransaction(goodsId, {
		    from: account,
		    gas: 1000000000000
		}, function(err, address){
		    if(err){
		        console.log(err);
		        return res.send("Maybe Error: authentication needed: password or unlock");
		    }
		    console.log("tx Hash: " + address);
		});
	} else {
		return res.send('The account is undefined!')
	}
});

app.listen(8080);