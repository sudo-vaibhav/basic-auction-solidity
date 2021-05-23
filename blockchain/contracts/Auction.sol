pragma solidity ^0.8.4;

contract Auction{
    // uint public productCount;
    struct Product{
        string name;
        uint minPrice;
        address payable seller;
        uint bidAmount;
        address payable bidder;
        uint endTime; // this is in milliseconds
        bool sold;
    }

    Product[] public products;
    
    event ProductEvent (Product);
    
    constructor(){
        
    }
    
    function addProduct() public{
        Product memory product = Product("My soul",100,payable(msg.sender),0,payable(address(0)),block.timestamp*1000+300000,false); // endTime 5 minutes from time of deployment by default
        products.push(product);
        emit ProductEvent(product);
    }
    
    function addProduct(string memory _name,uint _minPrice,uint _endTime) public{
        require(_minPrice>0,"minimum price should be a positive integer value");
        require(block.timestamp*1000<_endTime,"auction end time should be in future");
        Product memory product = Product(_name,_minPrice,payable(msg.sender),0,payable(0),_endTime,false);
        products.push(product);
        // productCount++;
        emit ProductEvent(product);
    }
    
    function claimProduct(uint _productId) public{
        // follow these checks
        Product storage product = products[_productId];
        // bidding time must be over
        require(product.endTime < block.timestamp*1000,"bidding for product is not over yet");
        // claimer must be bidder
        require(msg.sender == product.bidder,"you are not eligible to claim this product");
        
        // money sent to seller
        product.seller.transfer(product.bidAmount);
        
        // set product status sold to true
        product.sold = true;
        
        emit ProductEvent(product);
        
    }
    
    function getNow() view public returns (uint){
        return block.timestamp*1000;
    }
    
    function bid(uint _productId) payable public{
        Product storage product = products[_productId];
        
        // follow these checks
        
        // time should be lesser than last 
        require(block.timestamp*1000<product.endTime,"product auction has already ended");
        
        // bid should be greater than minPrice
        require(msg.value>=product.minPrice,"bid value shouldn't be less than the reserve value");
        
        // you should not be the last bidder , no point in outdoing your own bid
        require(msg.sender != product.bidder,"bidder can't out so their own bid");
        
        // the incoming value should be greater than previous bid
        require(msg.value > product.bidAmount,"big value not greater than previous bid"); 
        
        // refund older money to last bidder
        if(product.bidAmount>0){
            product.bidder.transfer(product.bidAmount);
        }
        
        
        // new bidder should be set as bidder
        product.bidder = payable(msg.sender);
        
        //change bid amount to new value
        product.bidAmount = msg.value;
        emit ProductEvent(product);
    }

    function getProducts() view public returns (Product[] memory){
        return products;
    }
}
