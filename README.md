# veToken contract design

This repo provides a template project for creating a voting escrow smart contract. This project is built using the hardhat framework. 
Users can stake their tokens (placeholder name: Token). Staked tokens are called veToken. Customize Token and veToken with your token name.

This voting escrow smart contract is inspired by Curve's veCRV smart contract which was written in Vyper. This project was written in Solidity with multiple optimizations and improvements.

## User checkpoint functions

Below functions change the state of the deposit for a user as well as for the global veToken total.

### 1. createLock(amount, duration, autoCooldown)

- Allows user to lock a given amount of their Token for a specific duration.
- Duration (unlock time) is rounded down to nearest week.
- Specify the auto-cooldown option.
- Conditions:
  - Lock amount must be greater than 0
  - User has enough Token balance.
  - User doesn't have an existing lock.
  - Unlock time must be greater than current timestamp
  - Unlock time must be smaller than current timestamp + duration

### 2. increaseAmount(value)

- Allows user to increase the amount of Token to lock.
- Conditions:
  - Value must be greater than 0.
  - User should have an existing lock.
  - Auto-cooldown
    - Enabled: User allowed to increase amount any time before the expiry date.
    - Disabled: User allowed to increase amount any time before the initial expiry date.
  - Lock shouldn't expired.

### 3. increaseUnlockTime(newUnlockTime)

- Allows user to increase the unlock time of a lock.
- new unlock time is rounded down to week.
- Conditions:
  - User must have an existing lock.
  - Can only increase the lock duration.
  - Can't increase the lock duration while in cooldown.
  - Can be increased up to max lock time.

### 4. initializeCooldown()

- Allows user to initialize the cooldown period.
- Rational for a cooldown period is to prevent users from getting rewards without the deposit being locked.
- Conditions:
  - Users can initialize cooldown starting from 7 days prior to the lock expiration.
  - Users can initiate a cooldown at any time post the lock expiration.
  - Auto-cooldown
    - Enabled: User allowed to increase unlock time any time before the expiry date.
    - Disabled: User allowed to increase unlock time any time before the initial expiry date.
- Questions:
  - Can users increase the lock duration after the cooldown period is initiated?

### 5. withdraw()

- Allows the user to withdraw tokens from the lock.
- Conditions:
  - User should have an existing lock.
  - Lock should be expired.
  - cooldown period is complete.

## Requirements

- The veToken balance for a user is a decaying entity. Starts from max at the time of deposit and decays to residual amount till cooldown is initiated and then to 0.

- User at any point of time should be able to query the veToken balance at the current timestamp | any previous time stamp.

- Able to query the total veToken deposit in the contract at any point of time in the past and current timestamp.
