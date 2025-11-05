// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title URLStorage for x402
 * @dev URL storage contract that works with x402 payment protocol
 * Payments are handled off-chain via x402, this contract only stores URLs
 */
contract URLStorage {
    // Structs
    struct URLRecord {
        string originalUrl;
        address creator;
        uint256 createdAt;
        bool exists;
    }

    // State variables
    address public owner;
    uint256 public shortUrlCounter;
    uint256 public totalUrlsCreated;
    
    // Authorized addresses that can create URLs (payment servers)
    mapping(address => bool) public authorizedServers;

    // Mappings
    mapping(string => URLRecord) public urlRecords;
    mapping(string => bool) public shortCodeExists;
    
    // Events
    event URLCreated(
        string indexed shortCode,
        string originalUrl,
        address indexed creator,
        address indexed server,
        uint256 timestamp
    );
    event ServerAuthorized(address indexed server, bool authorized);
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

    // Modifiers
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }

    modifier onlyAuthorized() {
        require(authorizedServers[msg.sender] || msg.sender == owner, 
            "Only authorized servers can create URLs");
        _;
    }

    constructor() {
        owner = msg.sender;
        // Initially authorize the deployer
        authorizedServers[msg.sender] = true;
    }

    /**
     * @dev Create a shortened URL (called by authorized server after x402 payment)
     * @param _originalUrl The original URL to shorten
     * @param _creator The address of the user who paid for the URL
     * @param _shortCode The short code to use
     */
    function createShortUrl(
        string memory _originalUrl,
        address _creator,
        string memory _shortCode
    ) 
        external 
        onlyAuthorized 
        returns (bool) 
    {
        require(bytes(_originalUrl).length > 0, "Invalid URL: empty string");
        require(!shortCodeExists[_shortCode], "Short code already exists");
        require(_creator != address(0), "Invalid creator address");

        // Store URL record
        urlRecords[_shortCode] = URLRecord({
            originalUrl: _originalUrl,
            creator: _creator,
            createdAt: block.timestamp,
            exists: true
        });

        // Mark short code as used
        shortCodeExists[_shortCode] = true;

        // Update counters
        shortUrlCounter++;
        totalUrlsCreated++;

        emit URLCreated(_shortCode, _originalUrl, _creator, msg.sender, block.timestamp);

        return true;
    }

    /**
     * @dev Get the original URL from a short code
     * @param _shortCode The short code to look up
     * @return The original URL
     */
    function getOriginalUrl(string memory _shortCode) 
        external 
        view 
        returns (string memory) 
    {
        URLRecord memory record = urlRecords[_shortCode];
        require(record.exists, "URL not found");
        return record.originalUrl;
    }

    /**
     * @dev Get URL record details
     * @param _shortCode The short code to query
     */
    function getUrlRecord(string memory _shortCode) 
        external 
        view 
        returns (
            string memory originalUrl,
            address creator,
            uint256 createdAt
        ) 
    {
        URLRecord memory record = urlRecords[_shortCode];
        require(record.exists, "URL not found");
        
        return (
            record.originalUrl,
            record.creator,
            record.createdAt
        );
    }

    /**
     * @dev Check if a short code exists
     * @param _shortCode The short code to check
     */
    function isShortCodeTaken(string memory _shortCode) 
        external 
        view 
        returns (bool) 
    {
        return shortCodeExists[_shortCode];
    }

    /**
     * @dev Authorize or revoke a server address (owner only)
     * @param _server The server address to authorize/revoke
     * @param _authorized Whether to authorize or revoke
     */
    function setServerAuthorization(address _server, bool _authorized) 
        external 
        onlyOwner 
    {
        authorizedServers[_server] = _authorized;
        emit ServerAuthorized(_server, _authorized);
    }

    /**
     * @dev Transfer ownership of the contract
     * @param newOwner The address of the new owner
     */
    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "New owner cannot be zero address");
        address previousOwner = owner;
        owner = newOwner;
        emit OwnershipTransferred(previousOwner, newOwner);
    }

    /**
     * @dev Get contract statistics
     */
    function getStats() 
        external 
        view 
        returns (
            uint256 totalUrls,
            address contractOwner
        ) 
    {
        return (
            totalUrlsCreated,
            owner
        );
    }
}
