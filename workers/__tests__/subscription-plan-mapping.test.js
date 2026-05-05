import { describe, it, expect } from 'vitest'
import { mapPaystackPlanCode } from '../auth-api.js'

const env = {
  PAYSTACK_PLAN_MONTHLY: 'PLN_e0z9m03nuwd582x',
  PAYSTACK_PLAN_ANNUAL: 'PLN_2ijmz43rukw84ql',
}

describe('mapPaystackPlanCode', () => {
  it('recognizes the configured monthly plan code', () => {
    expect(mapPaystackPlanCode('PLN_e0z9m03nuwd582x', env)).toEqual({
      plan: 'pro_monthly',
      recognized: true,
    })
  })

  it('recognizes the configured annual plan code', () => {
    expect(mapPaystackPlanCode('PLN_2ijmz43rukw84ql', env)).toEqual({
      plan: 'pro_annual',
      recognized: true,
    })
  })

  it('flags an unknown plan code so caller can alert', () => {
    expect(mapPaystackPlanCode('PLN_some_other_code', env)).toEqual({
      plan: 'pro_monthly',
      recognized: false,
    })
  })

  it('flags missing plan code so caller can alert', () => {
    expect(mapPaystackPlanCode(undefined, env)).toEqual({
      plan: 'pro_monthly',
      recognized: false,
    })
    expect(mapPaystackPlanCode(null, env)).toEqual({
      plan: 'pro_monthly',
      recognized: false,
    })
  })

  it('flags unrecognized when env vars are missing (avoids silent misclassification)', () => {
    expect(mapPaystackPlanCode('PLN_2ijmz43rukw84ql', {})).toEqual({
      plan: 'pro_monthly',
      recognized: false,
    })
  })
})
