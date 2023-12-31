import { HardhatRuntimeEnvironment } from "hardhat/types";
import {DeployFunction} from "hardhat-deploy/types";
import {ADDRESS_ZERO} from "../helper-hardhat-config";
import {ethers} from "hardhat"

const deploySetupcontracts: DeployFunction = async function (
    hre: HardhatRuntimeEnvironment
) {
    const {getNamedAccounts, deployments, network} = hre;
    const {log} = deployments;
    const {deployer} = await getNamedAccounts();
    const timeLock = await ethers.getContract("TimeLock", deployer)
    const governor = await ethers.getContract("GovernorContract", deployer)

    log("-------------------------------------------------------")
    log("Setting up roles...");
  
    const proposerRole = await timeLock.PROPOSER_ROLE();
    const executorRole = await timeLock.EXECUTOR_ROLE();
    const adminRole = await timeLock.TIMELOCK_ADMIN_ROLE();

    const proposerTx = await timeLock.grantRole(proposerRole, governor.address)
    await proposerTx.wait(1)
    const executorTx = await timeLock.grantRole(executorRole, ADDRESS_ZERO) // grant executor role to nobody
    await executorTx.wait(1)
    const revokeTx = await timeLock.revokeRole(adminRole, deployer)
    await revokeTx.wait(1)
    log("Set")
// Now, anything the timelock wants to do has to go through the governance process!
    log("-------------------------------------------------------")
}

export default deploySetupcontracts

deploySetupcontracts.tags = ["all", "setup"]