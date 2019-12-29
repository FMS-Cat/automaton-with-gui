import { BezierNode, FxDefinition, FxSection } from '@fms-cat/automaton';
import { AutomatonWithGUI } from '../../AutomatonWithGUI';
import { WithID } from '../../types/WithID';
import { jsonCopy } from '../../utils/jsonCopy';
import { produce } from 'immer';

// == state ========================================================================================
export interface State {
  instance?: AutomatonWithGUI;
  fxDefinitions: { [ name: string ]: FxDefinition };
  params: {
    [ name: string ]: {
      nodes: { [ id: string ]: BezierNode & WithID };
      fxs: { [ id: string ]: FxSection & WithID };
    };
  };
  isPlaying: boolean;
  time: number;
  length: number;
}

export const initialState: Readonly<State> = {
  params: {},
  fxDefinitions: {},
  isPlaying: false,
  time: 0.0,
  length: 1.0
};

// == action =======================================================================================
export type Action = {
  type: 'Automaton/SetInstance';
  automaton: AutomatonWithGUI;
} | {
  type: 'Automaton/AddFxDefinition';
  name: string;
  fxDefinition: FxDefinition;
} | {
  type: 'Automaton/CreateParam';
  param: string;
} | {
  type: 'Automaton/UpdateParamNode';
  param: string;
  id: string;
  node: BezierNode & WithID;
} | {
  type: 'Automaton/RemoveParamNode';
  param: string;
  id: string;
} | {
  type: 'Automaton/UpdateParamFx';
  param: string;
  id: string;
  fx: FxSection & WithID;
} | {
  type: 'Automaton/RemoveParamFx';
  param: string;
  id: string;
} | {
  type: 'Automaton/UpdateIsPlaying';
  isPlaying: boolean;
} | {
  type: 'Automaton/UpdateTime';
  time: number;
} | {
  type: 'Automaton/UpdateLength';
  length: number;
};

// == reducer ======================================================================================
export function reducer(
  state: State,
  action: Action
): State {
  return produce( state, ( newState: State ) => {
    if ( action.type === 'Automaton/SetInstance' ) {
      newState.instance = action.automaton;
    } else if ( action.type === 'Automaton/AddFxDefinition' ) {
      newState.fxDefinitions[ action.name ] = action.fxDefinition;
    } else if ( action.type === 'Automaton/CreateParam' ) {
      newState.params[ action.param ] = {
        nodes: {},
        fxs: {}
      };
    } else if ( action.type === 'Automaton/UpdateParamNode' ) {
      newState.params[ action.param ].nodes[ action.id ] = jsonCopy( action.node );
    } else if ( action.type === 'Automaton/RemoveParamNode' ) {
      delete newState.params[ action.param ].nodes[ action.id ];
    } else if ( action.type === 'Automaton/UpdateParamFx' ) {
      newState.params[ action.param ].fxs[ action.id ] = jsonCopy( action.fx );
    } else if ( action.type === 'Automaton/RemoveParamFx' ) {
      delete newState.params[ action.param ].fxs[ action.id ];
    } else if ( action.type === 'Automaton/UpdateIsPlaying' ) {
      newState.isPlaying = action.isPlaying;
    } else if ( action.type === 'Automaton/UpdateTime' ) {
      newState.time = action.time;
    } else if ( action.type === 'Automaton/UpdateLength' ) {
      newState.length = action.length;
    }
  } );
}
