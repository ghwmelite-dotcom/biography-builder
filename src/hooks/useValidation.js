import { useShallow } from 'zustand/react/shallow'
import { useBrochureStore } from '../stores/brochureStore'
import { isSectionComplete, getSectionCompletionCount, validateField } from '../utils/validation'

export function useSectionComplete(key) {
  return useBrochureStore((state) => isSectionComplete(key, state))
}

export function useOverallProgress() {
  return useBrochureStore(useShallow((state) => getSectionCompletionCount(state)))
}

export function useFieldValidation(fieldName) {
  return useBrochureStore((state) => {
    const value = state[fieldName]
    const required = ['fullName', 'dateOfBirth', 'dateOfDeath', 'funeralDate', 'funeralVenue']
    return {
      ...validateField(fieldName, value, state),
      isRequired: required.includes(fieldName),
    }
  })
}
