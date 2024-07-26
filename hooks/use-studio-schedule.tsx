import { useCallback, useReducer } from 'react';

type State = {
  isCreateModalOpen: boolean;
  isUpdateModalOpen: boolean;
  selectedDate: Date;
  rehearsalStartDate: Date | null;
};

type Action =
  | { type: 'OPEN_CREATE_TIMESLOT'; payload: Date }
  | { type: 'OPEN_UPDATE_MODAL'; payload: Date | null }
  | { type: 'CLOSE_CREATE_TIMESLOT' }
  | { type: 'CLOSE_UPDATE_MODAL' };

const initialState: State = {
  isCreateModalOpen: false,
  isUpdateModalOpen: false,
  selectedDate: new Date(),
  rehearsalStartDate: null,
};

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'OPEN_CREATE_TIMESLOT':
      return {
        ...state,
        isCreateModalOpen: true,
        selectedDate: action.payload,
      };
    case 'OPEN_UPDATE_MODAL':
      return {
        ...state,
        isUpdateModalOpen: true,
        rehearsalStartDate: action.payload,
      };
    case 'CLOSE_CREATE_TIMESLOT':
      return {
        ...state,
        isCreateModalOpen: false,
      };
    case 'CLOSE_UPDATE_MODAL':
      return {
        ...state,
        isUpdateModalOpen: false,
      };
    default:
      return state;
  }
};

export const useStudioSchedule = () => {
  const [state, dispatch] = useReducer(reducer, initialState);

  const openTimeslotModal = useCallback((date: Date) => {
    dispatch({ type: 'OPEN_CREATE_TIMESLOT', payload: date });
  }, []);

  const closeTimeslotModal = useCallback(() => {
    dispatch({ type: 'CLOSE_CREATE_TIMESLOT' });
  }, []);

  const openUpdateModal = useCallback((date: Date | null) => {
    dispatch({ type: 'OPEN_UPDATE_MODAL', payload: date });
  }, []);

  const closeUpdateModal = useCallback(() => {
    dispatch({ type: 'CLOSE_UPDATE_MODAL' });
  }, []);

  return {
    ...state,
    openTimeslotModal,
    closeTimeslotModal,
    openUpdateModal,
    closeUpdateModal,
  };
};
