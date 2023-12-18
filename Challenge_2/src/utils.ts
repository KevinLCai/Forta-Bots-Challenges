import { ethers } from "ethers";

export const poolExists = async (
  factoryAddress: string,
  factoryABI: string[],
  tokenPoolABI: string[],
  uniswapPoolAddress: string,
  provider: ethers.providers.Provider
) => {
  const uniswapV3Factory = new ethers.Contract(
    factoryAddress,
    factoryABI,
    provider
  );
  const uniswapPoolContract = new ethers.Contract(
    uniswapPoolAddress,
    tokenPoolABI,
    provider
  );
  const token0 = await uniswapPoolContract.token0();
  const token1 = await uniswapPoolContract.token1();
  const fee = await uniswapPoolContract.fee();
  let uniswapPool = await uniswapV3Factory.getPool(token0, token1, fee);
  return uniswapPool != "0x0000000000000000000000000000000000000000";
};
