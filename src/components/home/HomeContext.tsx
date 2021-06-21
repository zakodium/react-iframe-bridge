import { produce } from 'immer';
import {
  createContext,
  Dispatch,
  ReactNode,
  Reducer,
  useContext,
  useReducer,
} from 'react';

import { RocProvider } from '../../contexts/roc';
import { useSaveToLocalStorage } from '../../hooks/localStorage';
import { ActionType } from '../../types/util';
import { getItem } from '../../utils/localStorage';

interface HomeContextType {
  rocUrl: string;
  database: string;
  iframePage: string;
  iframeMode: 'closed' | 'sample' | 'no-sample';
  selectedSample: string | null;
}

function getInitialHomeContext(
  config: { rocUrl?: string; database?: string } = {},
): HomeContextType {
  const { rocUrl = 'http://localhost:3000/api/fake-roc', database = 'eln' } =
    config;
  return {
    rocUrl,
    database,
    iframePage: (getItem('dev-home-iframePage') as string) || '/dev/base-page',
    iframeMode: 'closed',
    selectedSample: null,
  };
}

type HomeContextAction =
  | ActionType<'SELECT_SAMPLE', string>
  | ActionType<'OPEN_NO_SAMPLE'>
  | ActionType<'SET_IFRAME_PAGE', string>;

const homeReducer: Reducer<HomeContextType, HomeContextAction> = produce(
  (state: HomeContextType, action: HomeContextAction) => {
    switch (action.type) {
      case 'OPEN_NO_SAMPLE':
        state.iframeMode = 'no-sample';
        state.selectedSample = null;
        break;
      case 'SELECT_SAMPLE':
        state.iframeMode = 'sample';
        state.selectedSample = action.payload;
        break;
      case 'SET_IFRAME_PAGE':
        state.iframePage = action.payload;
        break;
      default:
        throw new Error('unreachable');
    }
  },
);

const homeContext = createContext(getInitialHomeContext());
const homeDispatchContext = createContext<Dispatch<HomeContextAction>>(() => {
  // noop
});

interface HomeContextProviderProps {
  children: ReactNode;
  // eslint-disable-next-line react/no-unused-prop-types
  rocUrl?: string;
  // eslint-disable-next-line react/no-unused-prop-types
  database?: string;
}

export function HomeContextProvider(props: HomeContextProviderProps) {
  const [homeState, dispatch] = useReducer(
    homeReducer,
    props,
    getInitialHomeContext,
  );
  useSaveToLocalStorage('dev-home-iframePage', homeState.iframePage);

  return (
    <homeContext.Provider value={homeState}>
      <homeDispatchContext.Provider value={dispatch}>
        <RocProvider url={homeState.rocUrl} database={homeState.database}>
          {props.children}
        </RocProvider>
      </homeDispatchContext.Provider>
    </homeContext.Provider>
  );
}

export function useHomeContext() {
  return useContext(homeContext);
}

export function useHomeDispatchContext() {
  return useContext(homeDispatchContext);
}
