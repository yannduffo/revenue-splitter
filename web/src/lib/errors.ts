import { BaseError, ContractFunctionRevertedError, UserRejectedRequestError } from "viem";

export type TxError =
  | { kind: 'rejected' }
  | { kind: 'revert'; name: string; message: string }
  | { kind: 'unknown'; message: string }

// Solidity revert errors
const REVERT_MESSAGES: Record<string, string> = {
  Splitter__NothingToClaim: 'Nothing accrued yet for this token.',
  Splitter__InvalidArrayOfTokens: 'Select between 1 and 20 tokens.',
  Splitter__AlreadyInitialized: 'This splitter is already initialized.',
  Splitter__ArgsLengthMismatch: 'Members and shares must have the same length.',
  Splitter__TooManyMembers: 'A splitter can hold at most 50 members.',
  Splitter__SharesAreNotCorrectlyDistributed: 'Shares must add up to exactly 100%.',
  Splitter__MemberAddressIsZero: 'A member address is the zero address.',
  Splitter__MemberWithShareValueIsZero: 'Every member must have a share above zero.',
  Splitter__MemberAlreadyAdded: 'This address appears twice in the member list.',
  Splitter__MemberArrayEmpty: 'Add at least one member.',
}

//returning structured TxError regarding error received (BaseError, UserRejected, FunctionReverted)
export function parseTxError(error: unknown): TxError {
  //baseError
  if (!(error instanceof BaseError)) {
    return {kind:'unknown', message: error instanceof Error ? error.message : String(error)}
  }

  //UserRejected
  // "walk(e) go down encapsulated errors stack"
  if (error.walk((e) => e instanceof UserRejectedRequestError)) {
    return {kind: 'rejected'}
  }

  //Function Reverted
  const reverted = error.walk((e) => e instanceof ContractFunctionRevertedError)
  if (reverted instanceof ContractFunctionRevertedError) {
    const name = reverted.data?.errorName ?? 'UnknownRevert'
    return {
      kind: 'revert',
      name,
      message : REVERT_MESSAGES[name] ?? `Transaction revert: ${name}`,
    }
  }

  //defalut
  return {kind: 'unknown', message: error.shortMessage ?? error.message}
}
