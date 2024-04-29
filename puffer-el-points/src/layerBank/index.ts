/** viewed */

import { LToken, Transfer } from '../../generated/LayerBank/LToken'
import { PoolTokenPosition, Pool } from '../../generated/schema'
import { Address, BigInt } from '@graphprotocol/graph-ts'
import { fetchTokenBalanceAmount, fetchTokenSymbol } from '../aqua/utils/tokenHelper'
import { SPECIAL_ADDRESS } from '../constants'
import { setUserInvalid } from '../general'

export function handleTransfer(event: Transfer): void {
  setUserInvalid(event.address)

  const lToken = LToken.bind(event.address)
  const underlying = lToken.underlying()
  let pool = Pool.load(event.address)
  if (!pool) {
    pool = new Pool(event.address)
    pool.name = 'LayerBank'
    pool.symbol = fetchTokenSymbol(Address.fromBytes(lToken.underlying()))
    pool.underlying = underlying
    pool.decimals = BigInt.fromI32(lToken.decimals())
    pool.balance = BigInt.zero()
    pool.totalSupplied = BigInt.zero()
    pool.save()
  }
  // update from to
  if (event.params.from.notEqual(Address.zero()) && !SPECIAL_ADDRESS.includes(event.params.from.toHexString().toLowerCase())) {
    updateTokenPosition(event.params.from, event, pool)
  }

  // update to address
  if (event.params.to.notEqual(Address.zero()) && !SPECIAL_ADDRESS.includes(event.params.from.toHexString().toLowerCase())) {
    updateTokenPosition(event.params.to, event, pool)
  }
}

function updateTokenPosition(user: Address, event: Transfer, pool: Pool): void {



  const lToken = LToken.bind(event.address)

  // update pool
  let poolBalance = fetchTokenBalanceAmount(pool.underlying.toHexString(), pool.id.toHexString());

  pool.balance = poolBalance
  pool.totalSupplied = lToken.totalSupply();
  pool.save()


  const poolTokenPositionId = user.concat(pool.underlying).concat(pool.id)
  let poolTokenPosition = PoolTokenPosition.load(poolTokenPositionId)
  if (!poolTokenPosition) {
    poolTokenPosition = new PoolTokenPosition(poolTokenPositionId)
  }
  const supplied = lToken.balanceOf(user)
  poolTokenPosition.token = pool.underlying
  poolTokenPosition.pool = pool.id
  poolTokenPosition.poolName = 'LayerBank'
  poolTokenPosition.supplied = supplied
  poolTokenPosition.userPosition = user
  poolTokenPosition.save()
}


