import React, { useCallback } from 'react';
import { useDispatch, useSelector } from '../states/store';
import { ChannelList } from './ChannelList';
import { DopeSheet } from './DopeSheet';
import { DopeSheetOverlay } from './DopeSheetOverlay';
import { DopeSheetUnderlay } from './DopeSheetUnderlay';
import { Metrics } from '../constants/Metrics';
import { Scrollable } from './Scrollable';
import styled from 'styled-components';

// == styles =======================================================================================
const StyledChannelList = styled( ChannelList )`
  width: ${ Metrics.channelListWidth - 4 }px;
  margin: 0 2px;
`;

const StyledDopeSheet = styled( DopeSheet )`
  width: calc( 100% - ${ Metrics.channelListWidth }px );
  flex-grow: 1;
`;

const StyledDopeSheetUnderlay = styled( DopeSheetUnderlay )`
  position: absolute;
  width: calc( 100% - ${ Metrics.channelListWidth }px );
  height: 100%;
  left: ${ Metrics.channelListWidth }px;
  top: 0;
`;

const StyledDopeSheetOverlay = styled( DopeSheetOverlay )`
  position: absolute;
  width: calc( 100% - ${ Metrics.channelListWidth }px );
  height: 100%;
  left: ${ Metrics.channelListWidth }px;
  top: 0;
  pointer-events: none;
`;

const ChannelListAndDopeSheetContainer = styled.div`
  display: flex;
  padding-bottom: 4px;
`;

const ChannelListAndDopeSheetScrollable = styled( Scrollable )`
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
`;

const Root = styled.div`
`;

// == component ====================================================================================
const ChannelListAndDopeSheet = ( props: {
  className?: string;
} ): JSX.Element => {
  const { className } = props;
  const dispatch = useDispatch();
  const {
    automaton,
    selectedChannel,
    selectedCurve
  } = useSelector( ( state ) => ( {
    automaton: state.automaton.instance,
    selectedChannel: state.timeline.selectedChannel,
    selectedCurve: state.curveEditor.selectedCurve
  } ) );

  const realm: 'dopeSheet' | 'timeline' | 'curveEditor' = (
    selectedCurve != null ? 'curveEditor' :
    selectedChannel != null ? 'timeline' :
    'dopeSheet'
  );

  const shouldShowChannelList = realm === 'dopeSheet' || realm === 'timeline';

  const createChannel = useCallback(
    ( x: number, y: number ) => {
      if ( !automaton ) { return; }

      dispatch( {
        type: 'TextPrompt/Open',
        position: { x, y },
        placeholder: 'Name for the new channel',
        checkValid: ( name ) => {
          if ( name === '' ) { return false; }
          if ( automaton.getChannel( name ) != null ) { return false; }
          return true;
        },
        callback: ( name ) => {
          const redo = (): void => {
            automaton.createChannel( name );
          };

          const undo = (): void => {
            automaton.removeChannel( name );
          };

          dispatch( {
            type: 'History/Push',
            entry: {
              description: `Create Channel: ${ name }`,
              redo,
              undo
            }
          } );
          redo();
        }
      } );
    },
    [ automaton ]
  );

  const handleContextMenu = useCallback(
    ( event: React.MouseEvent ): void => {
      event.preventDefault();
      event.stopPropagation();

      const x = event.clientX;
      const y = event.clientY;

      dispatch( {
        type: 'ContextMenu/Open',
        position: { x, y },
        commands: [
          {
            name: 'Create Channel',
            description: 'Create a new channel.',
            callback: () => createChannel( x, y )
          }
        ]
      } );
    },
    [ createChannel ]
  );

  return (
    <Root className={ className }
      onContextMenu={ handleContextMenu }
    >
      { realm === 'dopeSheet' && <StyledDopeSheetUnderlay /> }
      <ChannelListAndDopeSheetScrollable barPosition='left'>
        <ChannelListAndDopeSheetContainer>
          { shouldShowChannelList && <StyledChannelList /> }
          { realm === 'dopeSheet' && <StyledDopeSheet /> }
        </ChannelListAndDopeSheetContainer>
      </ChannelListAndDopeSheetScrollable>
      { realm === 'dopeSheet' && <StyledDopeSheetOverlay /> }
    </Root>
  );
};

export { ChannelListAndDopeSheet };
