import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from '../states/store';
import { Colors } from '../constants/Colors';
import { InspectorHeader } from './InspectorHeader';
import { InspectorHr } from './InspectorHr';
import { InspectorItem } from './InspectorItem';
import { NumberParam } from './NumberParam';
import styled from 'styled-components';

// == styles =======================================================================================
const ConfirmNotice = styled.div`
  margin: 0.15rem;
  font-size: 0.7rem;
  line-height: 1em;
  width: calc( 100% - 0.3rem );
  text-align: center;
`;

const ConfirmButton = styled.div`
  margin: 0.15rem auto;
  font-size: 0.8rem;
  line-height: 1.2rem;
  width: 4rem;
  text-align: center;
  background: ${ Colors.back3 };
  cursor: pointer;

  &:hover {
    background: ${ Colors.back4 };
  }

  &:active {
    background: ${ Colors.back1 };
  }
`;

// == element ======================================================================================
export interface InspectorGeneralProps {
  className?: string;
}

const InspectorGeneral = (): JSX.Element => {
  const dispatch = useDispatch();
  const {
    automaton,
    settingsMode,
    initLength,
    initResolution
  } = useSelector( ( state ) => ( {
    automaton: state.automaton.instance,
    settingsMode: state.settings.mode,
    initLength: state.automaton.length,
    initResolution: state.automaton.resolution
  } ) );
  const [ length, setLength ] = useState( 0.0 );
  const [ resolution, setResolution ] = useState( 0.0 );

  useEffect(
    () => {
      if ( settingsMode === 'general' ) {
        setLength( initLength );
        setResolution( initResolution );
      }
    },
    [ automaton, settingsMode, initLength, initResolution ]
  );

  return <>
    { automaton && <>
      <InspectorHeader text="General Config" />

      <InspectorHr />

      <InspectorItem name="Length">
        <NumberParam
          type="float"
          value={ length }
          onChange={ ( value ) => {
            setLength( Math.max( 0.0, value ) );
          } }
        />
      </InspectorItem>

      <InspectorItem name="Resolution">
        <NumberParam
          type="int"
          value={ resolution }
          onChange={ ( value ) => {
            setResolution( Math.max( 0.0, value ) );
          } }
        />
      </InspectorItem>

      <InspectorHr />

      <ConfirmNotice>This cannot be undone!</ConfirmNotice>
      <ConfirmButton
        onClick={ () => {
          automaton.setLength( length, resolution );

          dispatch( {
            type: 'History/Drop'
          } );
        } }
      >
        Apply
      </ConfirmButton>
    </> }
  </>;
};

export { InspectorGeneral };
