import { Address } from "@graphprotocol/graph-ts"
import { UserPosition } from "../generated/schema"

// using for setting contract address invalid
export function setUserInvalid(user: Address): UserPosition {
    let userPosition = UserPosition.load(user)
    if (!userPosition) {
        userPosition = new UserPosition(user)
    }
    userPosition.validate = false
    userPosition.save()

    return userPosition
}

