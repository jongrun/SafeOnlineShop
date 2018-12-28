pragma solidity ^0.5.0;
pragma experimental ABIEncoderV2;


contract SafeOnlineShop{

	address payable public seller; // 卖家，商店拥有者

	enum GoodsState { OnSale, Ordered, Delivering, Sold, Invalid } // 商品状态

	// 定义单个商品
	struct Goods{
		uint productId; // 对应的商品集id
		uint goodsId; // 商品id
		address payable buyer; // 买家
		address payable seller; // 卖家
		GoodsState state; // 状态
	}

	// 定义一个相同商品集（相同商品的集合）
	struct Product{
	    uint productId; // 商品集id，每种商品有一个id
		uint[] goodsIds; // 该商品集包含的所有未销售商品的id
		uint price;  // 商品价格
		uint stock;  // 商品库存
		string description; // 商品描述
	}

	Product[] public products; // 不同商品集，以productId作为下标
	Goods[] public allGoods; // 所有商品（包括已售和未售），以goodsId作为下标

	uint public productsCount = 0; // 商品集数量

    address public contractAddr;

	constructor() public {
		seller = msg.sender;
	}
	

	modifier onlySeller(){
		require(
			msg.sender == seller,
			"Only seller can call this."
		);
		_;
	}

	modifier onlyBuyer(uint goodsId) {
        require(
            msg.sender == allGoods[goodsId].buyer,
            "Only the buyer of the goods can call this."
        );
        _;
    }

    modifier inGoodsState(uint goodsId, GoodsState _state) {
        require(
            allGoods[goodsId].state == _state,
            "Invalid goods state."
        );
        _;
    }

    modifier condition(bool _condition) {
        require(
        	_condition,
        	"Not satisfy the base condition."
        );
        _;
    }

    // 要求发送足够的value
    modifier valueEnough(uint value){
    	require(msg.value >= value, "Value is not enough.");
        if(msg.value > value){ // 若金额超过保证金则退回多余部分
			msg.sender.transfer(msg.value - value);
		}
		_;
    }


    event AddNewProductOK(); // 增加新商品成功
    event StockSet(); // 设置库存成功

    event OrderPlaced(uint[] goodsId); // 订单下达成功
    event ConfirmReceived(); // 确认收货成功


    function setAddress(address addr) public {
    	contractAddr = addr;
    }

	///卖家添加新商品
	function addNewProduct(uint amount, uint price, string memory description) 
	    public
	    onlySeller
	    condition(amount > 0 && price >= 0)
	    valueEnough(price * amount * 2) // 需缴纳商品价格的两倍保证金
	    payable
	    returns (bool) {
	    emit AddNewProductOK();
		uint productId = products.length;
		// 定义商品id数组并赋值
		uint[] memory someGoodsIds = new uint[](amount);
		for(uint i = 0; i < amount; i++){
			uint goodsId = allGoods.length;
			someGoodsIds[i]= goodsId;
			Goods memory goods;
			goods.productId = productId; goods.goodsId = goodsId; 
			goods.seller = seller; goods.state = GoodsState.OnSale;
			allGoods.push(goods); // 将商品加入allGoods
		}
	    products.push(Product(productId, someGoodsIds, price, amount ,description));

	    productsCount = products.length;
	    return true;
	}
	
	/// 卖家手动设置指定已有商品的库存
	function setStock(uint productId, uint stock)
		public
		onlySeller
		payable
		condition(productId < products.length && stock >= 0) 
		returns (bool){
		if(products[productId].stock < stock){
			increaseStock(productId, stock - products[productId].stock);
		} else {
			decreaseStock(productId, products[productId].stock - stock);
		}
		emit StockSet();
		return true;
	}

	/**
	 * 卖家增加指定商品一定数量库存
	 */
	function increaseStock(uint productId, uint amount) 
	    public 
	    onlySeller
	    payable
	    condition(productId < products.length && amount > 0) 
	    valueEnough(products[productId].price * amount * 2)
	    returns (bool){
		for (uint i = 0; i < amount; i++) {
			uint goodsId = allGoods.length;
			Goods memory goods;
		    goods.productId = productId; goods.goodsId = goodsId; 
		    goods.seller = seller; goods.state = GoodsState.OnSale;
			allGoods.push(goods); // 将商品加入allGoods
			products[productId].goodsIds.push(goodsId);
			products[productId].stock += 1;
		}
		
    	return true;
	}

	/// 卖家减少指定商品一定数量库存
	function decreaseStock(uint productId, uint amount)
		public
		onlySeller
		payable
		condition(products.length > productId && products[productId].stock >= amount && amount >= 0){
		// 把对应商品的状态改为无效
		for(uint i = 0; i < amount; i--){
			require(allGoods[products[productId].goodsIds.length - 1 - i].state == GoodsState.OnSale, "Can't remove the goods not on sale");
			allGoods[products[productId].goodsIds.length - 1 - i].state = GoodsState.Invalid;
		}
		// 减少库存量
		products[productId].stock -= amount;
		products[productId].goodsIds.length -= amount;
		seller.transfer(products[productId].price * amount * 2); // 退回保证金
	}

	/// 买家下达一定数量某商品订单
	function placeOrder(uint productId, uint amount)
		public
		condition(products.length > productId && products[productId].stock >= amount)
		valueEnough(products[productId].price * amount * 2) // 需要先付两倍商品价格，确认收货时再退回一半
		payable
		returns (uint[] memory){
		// 待买的商品id数组
		uint[] memory toBuyGoodsIds = new uint[](amount);
		for(uint i = 0; i < amount; i++){ // 取商品集的最后amount个商品
			uint stock = products[productId].stock;
			toBuyGoodsIds[i] = products[productId].goodsIds[stock - amount + i];
			require(allGoods[toBuyGoodsIds[i]].state == GoodsState.OnSale, "The Goods is not on sale");
			allGoods[toBuyGoodsIds[i]].buyer = msg.sender;
			allGoods[toBuyGoodsIds[i]].state = GoodsState.Ordered; // 将状态设为Ordered
		}
		// 暂时减少库存，买家确认收货时才真正交易完成
		products[productId].stock -= amount;
		products[productId].goodsIds.length -= amount;
		emit OrderPlaced(toBuyGoodsIds);
		return toBuyGoodsIds;
	}

	///买家确认收货
	function confirmReceived(uint goodsId)
		public
		onlyBuyer(goodsId)
		inGoodsState(goodsId, GoodsState.Ordered){
		allGoods[goodsId].state = GoodsState.Sold; // 将状态改为已卖出
		uint price = products[allGoods[goodsId].productId].price;
		msg.sender.transfer(price); // 把剩下的一半金额退回买家
		allGoods[goodsId].seller.transfer(price * 3); // 把价格加上保证金退回卖家
		emit ConfirmReceived();
	}

}