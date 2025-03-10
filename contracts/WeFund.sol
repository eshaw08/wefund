// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract WeFund {
    struct Campaign {
        address owner;
        string title;
        string description;
        uint goalAmount;
        uint raisedAmount;
        bool completed;
    }

    mapping(uint => Campaign) public campaigns;
    uint public campaignCount;

    event CampaignCreated(uint campaignId, address owner, string title, uint goalAmount);
    event DonationReceived(uint campaignId, address donor, uint amount);

    // Create a new campaign
    function createCampaign(string memory _title, string memory _description, uint _goalAmount) public {
        require(_goalAmount > 0, "Goal amount must be greater than zero");

        campaigns[campaignCount] = Campaign({
            owner: msg.sender,
            title: _title,
            description: _description,
            goalAmount: _goalAmount,
            raisedAmount: 0,
            completed: false
        });

        emit CampaignCreated(campaignCount, msg.sender, _title, _goalAmount);
        campaignCount++;
    }

    // Donate to a campaign
    function donate(uint _campaignId) public payable {
        require(_campaignId < campaignCount, "Campaign does not exist");
        require(msg.value > 0, "Donation amount must be greater than zero");

        Campaign storage campaign = campaigns[_campaignId];
        require(!campaign.completed, "Campaign is already completed");

        campaign.raisedAmount += msg.value;
        emit DonationReceived(_campaignId, msg.sender, msg.value);
    }

    // Withdraw funds when the goal is reached
    function withdrawFunds(uint _campaignId) public {
        require(_campaignId < campaignCount, "Campaign does not exist");

        Campaign storage campaign = campaigns[_campaignId];
        require(msg.sender == campaign.owner, "Only the campaign owner can withdraw funds");
        require(campaign.raisedAmount >= campaign.goalAmount, "Fundraising goal not yet reached");

        campaign.completed = true;
        payable(campaign.owner).transfer(campaign.raisedAmount);
    }

    // Get campaign details
    function getCampaign(uint _campaignId) public view returns (
        address, string memory, string memory, uint, uint, bool
    ) {
        Campaign memory c = campaigns[_campaignId];
        return (c.owner, c.title, c.description, c.goalAmount, c.raisedAmount, c.completed);
    }
}
