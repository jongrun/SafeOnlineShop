


# 一、选题背景与依据

在互联网的背景下，网购因其便捷、便宜，已成为人们购物的主要方式之一。但其中还是存在一些问题。

第一，由于大数据平台对数据的贩卖，网购容易导致**泄露用户隐私**，比如刚刚浏览某个购物网站，在其他的社交平台上就会看到类似的广告弹窗。这是由于网购平台是一个**中心化**的平台，所有的用户数据都由一个中心集中管理，尽管声称会保护用户隐私，但数据毕竟掌握在中心平台手中，用户失去了对数据的自主控制权，所有的行动都要基于对第三方平台的信任。

第二，网购所有的交易也是基于对第三方支付的**信任**，一旦“第三方总是诚信的”这一基础崩塌的话，就可能会造成莫大的损失。

这几个问题都可以在区块链上得到解决。首先，在区块链上，用户的所有交易都是**匿名**的，不会泄露用户信息；第二，交易由哈希加密确保安全性，不用通过第三方，即**去中心化**，自然就不用担心第三方的信任问题，并且所有的交易由智能合约规定的逻辑自动执行，只要智能合约的逻辑被被接受且能抵抗攻击，则交易就是安全的，并且所有交易和购买记录可在区块链和智能合约上**追溯**，且**不可篡改**。

与一般的网购平台相比，基于区块链的网上安全商铺有以下优点：去中心化，用户不用向第三方平台泄露信息，从而**对个人信息有更大的控制权**；交易不通过第三方，**规避了第三方信任的风险**，交易记录可追溯且不可篡改。



# 二、使用说明

- 登录

  在首页输入账户地址，点击 "Sign in" 进入个人主页。（图片不能正常显示，看README.pdf可以有图片）

  ![1545992574311](C:\Users\lenov\AppData\Roaming\Typora\typora-user-images\1545992574311.png)

- 个人主页

  ![1545992630683](C:\Users\lenov\AppData\Roaming\Typora\typora-user-images\1545992630683.png)

  - 显示个人地址，余额，区块数
  - 点击 “Open Shop” 可以开一家属于自己的网上商铺（部署一个合约），成功后会直接跳转到商店页面；
  - 或者输入商店地址（合约地址），点击 “Go” 跳转到商店页面

- 商店页面

  - 显示商店地址，卖家账户地址，商店（合约）余额，商品列表，以及可以进行的一些操作

  - 卖家

    若当前账户为商店卖家，则会显示 “Add New Product” 和 “Set Stock" 两个按钮。

    ![1545993181036](C:\Users\lenov\AppData\Roaming\Typora\typora-user-images\1545993181036.png)

    - 添加商品

      点击 "Add New Product"，进入添加商品界面

      输入个数，价格，以及商品描述，点击 “Add New”，添加成功后会跳转回商店界面，商品列表新增条目，每个条目包括：商品id、描述、价格（以Wei为单位）、库存

      ![1545993901881](C:\Users\lenov\AppData\Roaming\Typora\typora-user-images\1545993901881.png)

      ![1545993920935](C:\Users\lenov\AppData\Roaming\Typora\typora-user-images\1545993920935.png)

      由于商家需要给商品两倍价格的保证金，所以此时商店的余额已经变为200 * 10 * 2 = 4000 Wei，返回看卖家的余额也会减少相应值：（为方便测试已将gasPrice设为0）

      ![1545997637188](C:\Users\lenov\AppData\Roaming\Typora\typora-user-images\1545997637188.png)

    - 设置库存

      在商店界面点击 "Set Stock" 或者直接点击商品条目可以设置商品的库存。

      跳转到设置库存的界面，输入商品id（若是点击商品条目进来的，则商品id已经自动设好，不用输入）以及新的库存，点击 "Set stock"，若设置成功则会返回商店界面。

      ![1545997247212](C:\Users\lenov\AppData\Roaming\Typora\typora-user-images\1545997247212.png)

      ![1545998783117](C:\Users\lenov\AppData\Roaming\Typora\typora-user-images\1545998783117.png)

      ![1545998767031](C:\Users\lenov\AppData\Roaming\Typora\typora-user-images\1545998767031.png)

  - 买家

    若当前账户为不为商店卖家，即为买家，则会显示 “Place Order” 和 “Confirm Received" 两个按钮

    - 下订单

      点击Place Order或者直接点击商品条目进入下订单页面，输入商品id（若是点击商品条目进来的，则商品id已经自动生成，不用输入）和购买数量，即可下订单，若下达订单成功，则会返回交易哈希和合约地址等重要数据，其中的goodsId对应商店的唯一一个具体商品实体，用来确认收货时输入，并可根据此id搜索到该商品的买家、卖家、状态等信息，是该合约的安全保障。

      ![1545999328609](C:\Users\lenov\AppData\Roaming\Typora\typora-user-images\1545999328609.png)

      ![1546000861110](C:\Users\lenov\AppData\Roaming\Typora\typora-user-images\1546000861110.png)

      ![1546000839778](C:\Users\lenov\AppData\Roaming\Typora\typora-user-images\1546000839778.png)

      ![1546000364359](C:\Users\lenov\AppData\Roaming\Typora\typora-user-images\1546000364359.png)



      再回去看买家的余额，减少了相应金额。

    - 确认收货

      点击Confirm Received，跳转到确认收货界面，输入下订单时返回的商品唯一标识goodsId，点击Received，即可确认收货，此时商店会把该商品的价格的三倍金额返回给商家，一倍价格的金额返回给买家，这样商家就收回了保证金以及卖出的收入，买家则收回下订单时给出的多出一倍的金额。这个机制可以督促卖家发货，买家确认收货。（下图与上述操作不同步，同步的完整操作过程见测试部分）

      ![1546005756507](C:\Users\lenov\AppData\Roaming\Typora\typora-user-images\1546005756507.png)

      确认收货成功，会返回该商品的商店地址、买家地址、卖家地址、以及商品状态等信息，可以作为购买凭证。

      ![1546005973247](C:\Users\lenov\AppData\Roaming\Typora\typora-user-images\1546005973247.png)

# 三、测试

- 运行ganache-cli

  运行ganache-cli，生成十个账户地址，为了方便测试，将gasPrice设置为0

  ![1546002671549](C:\Users\lenov\AppData\Roaming\Typora\typora-user-images\1546002671549.png)

- 运行程序

  ![1546002784125](C:\Users\lenov\AppData\Roaming\Typora\typora-user-images\1546002784125.png)

- 登录

  在首页输入第一个测试账户地址，点击 "Sign in" 进入个人主页。

  ![1546002849859](C:\Users\lenov\AppData\Roaming\Typora\typora-user-images\1546002849859.png)

- 个人主页

  ![1546002865571](C:\Users\lenov\AppData\Roaming\Typora\typora-user-images\1546002865571.png)

  - 显示个人地址，余额，区块数

  - 点击 “Open Shop” 开一家属于自己的网上商铺（部署一个合约），成功后直接跳转到商店页面；

    console：

    ![1546003186394](C:\Users\lenov\AppData\Roaming\Typora\typora-user-images\1546003186394.png)

    ganache-cli:

    ![1546003271864](C:\Users\lenov\AppData\Roaming\Typora\typora-user-images\1546003271864.png)

    ![1546003326493](C:\Users\lenov\AppData\Roaming\Typora\typora-user-images\1546003326493.png)	

  - 商店界面显示商店地址，卖家账户地址，商店（合约）余额，商品列表，以及可以进行的一些操作

  - 卖家

    当前账户为商店卖家，则会显示 “Add New Product” 和 “Set Stock" 两个按钮。

    ![1545993181036](C:\Users\lenov\AppData\Roaming\Typora\typora-user-images\1545993181036.png)

    - 添加商品

      点击 "Add New Product"，进入添加商品界面。

      输入个数，价格，以及商品描述，点击 “Add New”。

      ![1546003519266](C:\Users\lenov\AppData\Roaming\Typora\typora-user-images\1546003519266.png)

      console：

      ![1546003569439](C:\Users\lenov\AppData\Roaming\Typora\typora-user-images\1546003569439.png)

      ganache-cli：

      ![1546003607108](C:\Users\lenov\AppData\Roaming\Typora\typora-user-images\1546003607108.png)

      添加成功后会跳转回商店界面，商品列表新增条目：

      ![1546003618858](C:\Users\lenov\AppData\Roaming\Typora\typora-user-images\1546003618858.png)

      由于商家需要给商品两倍价格的保证金，所以此时商店的余额已经变为200 * 10 * 2 = 4000 Wei，返回看卖家的余额也会减少相应值：（为方便测试已将gasPrice设为0）

      ![1546003666001](C:\Users\lenov\AppData\Roaming\Typora\typora-user-images\1546003666001.png)

    - 设置库存

      在商店界面直接点击商品条目设置商品的库存，设置成功返回商店界面。

      ![1546003765126](C:\Users\lenov\AppData\Roaming\Typora\typora-user-images\1546003765126.png)

      console：

      ![1546003819029](C:\Users\lenov\AppData\Roaming\Typora\typora-user-images\1546003819029.png)

      ganache-cli：

      ![1546003845354](C:\Users\lenov\AppData\Roaming\Typora\typora-user-images\1546003845354.png)

      ![1546003780091](C:\Users\lenov\AppData\Roaming\Typora\typora-user-images\1546003780091.png)

      可见商品库存已经相应改变，商店余额也相应变为200 * 5 * 2 = 2000 Wei。

  - 买家

    用第二个账户登录，输入以上商店的地址，点击Go，进入该商店。

    ![1546004022088](C:\Users\lenov\AppData\Roaming\Typora\typora-user-images\1546004022088.png)

    当前账户为不为商店卖家，即为买家，则会显示 “Place Order” 和 “Confirm Received" 两个按钮。

    ![1546004152266](C:\Users\lenov\AppData\Roaming\Typora\typora-user-images\1546004152266.png)

    - 下订单

      直接点击商品条目进入下订单页面，输入商品id（若是点击商品条目进来的，则商品id已经自动生成，不用输入）和购买数量。

      ![1546004173493](C:\Users\lenov\AppData\Roaming\Typora\typora-user-images\1546004173493.png)

      点击OK下订单，下达订单成功，返回交易哈希和合约地址等重要数据，其中的goodsId对应商店的唯一一个具体商品实体，用来确认收货时输入，并可根据此id搜索到该商品的买家、卖家、状态等信息，是该合约的安全保障。

      ![1546004214488](C:\Users\lenov\AppData\Roaming\Typora\typora-user-images\1546004214488.png)

      console：

      ![1546004327129](C:\Users\lenov\AppData\Roaming\Typora\typora-user-images\1546004327129.png)

      ganache-cli：

      ![1546005292448](C:\Users\lenov\AppData\Roaming\Typora\typora-user-images\1546005292448.png)

      此时，买家需要先付两倍价格（确认收货时再退回一半），商店的余额从2000变为400，增加了200 * 1 * 2 = 400 Wei

      ![1546004779640](C:\Users\lenov\AppData\Roaming\Typora\typora-user-images\1546004779640.png)

      再回去看买家的余额，减少了相应金额。

      ![1546005236528](C:\Users\lenov\AppData\Roaming\Typora\typora-user-images\1546005236528.png)

    - 确认收货

      点击Confirm Received，跳转到确认收货界面，输入下订单时返回的商品唯一标识goodsId，点击Received，确认收货。

      ![1546005756507](C:\Users\lenov\AppData\Roaming\Typora\typora-user-images\1546005756507.png)

      console：

      ![1546005884443](C:\Users\lenov\AppData\Roaming\Typora\typora-user-images\1546005884443.png)

      ganache-cli：

      ![1546005919708](C:\Users\lenov\AppData\Roaming\Typora\typora-user-images\1546005919708.png)

      确认收货成功，会返回该商品的商店地址、买家地址、卖家地址、以及商品状态等信息，可以作为购买凭证。

      ![1546005973247](C:\Users\lenov\AppData\Roaming\Typora\typora-user-images\1546005973247.png)

      此时商店会把该商品的价格的三倍金额返回给商家，一倍价格的金额返回给买家，这样商家就收回了保证金以及卖出的收入，买家则收回下订单时给出的多出一倍的金额。这个机制可以督促卖家发货，买家确认收货。

      可见此时商店余额由2400变为1600，减少了 200 * 1 * 4 = 800。

      ![1546006198396](C:\Users\lenov\AppData\Roaming\Typora\typora-user-images\1546006198396.png)

      买家的余额下订单时减少了400Wei，现在增加了200Wei，相当于花了200Wei：

      ![1546006369707](C:\Users\lenov\AppData\Roaming\Typora\typora-user-images\1546006369707.png)

      再看买家的余额，增加了600Wei，收回了400Wei保证金，并收入200Wei：

      ![1546006521829](C:\Users\lenov\AppData\Roaming\Typora\typora-user-images\1546006521829.png)


所有源码Github地址：https://github.com/Runner1014/SafeOnlineShop

注：登录界面的模板代码来自 模板之家：http://www.cssmoban.com/cssthemes/7727.shtml
