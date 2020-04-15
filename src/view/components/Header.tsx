import React, { useCallback, useMemo, useState } from 'react';
import { useDispatch, useSelector } from '../states/store';
import { Colors } from '../constants/Colors';
import { HeaderSeekbar } from './HeaderSeekbar';
import { Icons } from '../icons/Icons';
import { Metrics } from '../constants/Metrics';
import styled from 'styled-components';
import { writeClipboard } from '../utils/clipboard';

// == microcomponent ===============================================================================
const ShouldSaveIndicator = ( { className }: {
  className?: string;
} ): JSX.Element => {
  const shouldSave = useSelector( ( state ) => state.automaton.shouldSave );

  return <div
    className={ className }
    style={ {
      visibility: shouldSave ? 'visible' : 'hidden'
    } }
    data-stalker={ 'You might want to save the file before leave' }
  />;
};

// == styles =======================================================================================
const StyledHeaderSeekbar = styled( HeaderSeekbar )`
  width: 8rem;
  height: calc( ${ Metrics.headerHeight } - 0.25rem );
`;

const Section = styled.div`
  display: flex;

  & > * {
    margin: 0 0.25rem;
  }
`;

const Button = styled.img<{ disabled?: boolean; active?: boolean }>`
  width: calc( ${ Metrics.headerHeight } - 0.25rem );
  height: calc( ${ Metrics.headerHeight } - 0.25rem );
  fill: ${ ( { disabled: disabled, active: active } ) => disabled ? Colors.gray : active ? Colors.accent : Colors.fore };
  cursor: pointer;

  &:hover {
    fill: ${ ( { disabled: disabled, active: active } ) => disabled ? Colors.gray : active ? Colors.accentdark : Colors.foresub };
  }
`;

const Logo = styled.img`
  height: calc( ( ${ Metrics.headerHeight } - 0.25rem ) * 0.6 );
  margin: calc( ( ${ Metrics.headerHeight } - 0.25rem ) * 0.2 );
  fill: ${ Colors.fore };
  opacity: 0.5;
  cursor: pointer;

  &:hover {
    opacity: 0.8;
  }

  &:active {
    opacity: 0.5;
  }
`;

const StyledShouldSaveIndicator = styled( ShouldSaveIndicator )`
  width: 6px;
  height: 6px;
  border-radius: 3px;
  margin: auto 0 auto 6px;
  background: ${ Colors.accent };
`;

const Root = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 0.125rem;
  background: ${ Colors.back4 };
`;

// == element ======================================================================================
export interface HeaderProps {
  className?: string;
}

const Header = ( { className }: HeaderProps ): JSX.Element => {
  const dispatch = useDispatch();
  const [ isSavedRecently, setIsSavedRecently ] = useState( false );
  const {
    automaton,
    isDisabledTimeControls,
    isPlaying,
    settingsMode,
    historyIndex,
    historyEntries,
    cantUndoThis
  } = useSelector( ( state ) => ( {
    automaton: state.automaton.instance,
    isDisabledTimeControls: state.automaton.isDisabledTimeControls,
    isPlaying: state.automaton.isPlaying,
    settingsMode: state.settings.mode,
    historyIndex: state.history.index,
    historyEntries: state.history.entries,
    cantUndoThis: state.history.cantUndoThis
  } ) );

  const handlePlay = useCallback(
    (): void => {
      if ( !automaton ) { return; }
      automaton.togglePlay();
    },
    [ automaton ]
  );

  const handleUndo = useCallback(
    (): void => {
      if ( historyIndex !== 0 ) {
        historyEntries[ historyIndex - 1 ].undo();
        dispatch( { type: 'History/Undo' } );
      } else {
        if ( cantUndoThis === 9 ) {
          window.open( 'https://youtu.be/bzY7J0Xle08', '_blank' );
          dispatch( {
            type: 'History/SetCantUndoThis',
            cantUndoThis: 0
          } );
        } else {
          dispatch( {
            type: 'History/SetCantUndoThis',
            cantUndoThis: cantUndoThis + 1
          } );
        }
      }
    },
    [ historyIndex, historyEntries, cantUndoThis ]
  );

  const handleRedo = useCallback(
    (): void => {
      if ( historyIndex !== historyEntries.length ) {
        historyEntries[ historyIndex ].redo();
        dispatch( { type: 'History/Redo' } );
      }
      dispatch( {
        type: 'History/SetCantUndoThis',
        cantUndoThis: 0
      } );
    },
    [ historyIndex, historyEntries ]
  );

  const handleSave = useCallback(
    () => {
      if ( !automaton ) { return; }

      if ( automaton.overrideSave ) {
        automaton.overrideSave();
      } else {
        const data = automaton.serialize();

        writeClipboard( JSON.stringify( data ) );

        automaton.shouldSave = false;

        setIsSavedRecently( true );
        setTimeout( () => {
          setIsSavedRecently( false );
        }, 3000 );
      }
    },
    [ automaton ]
  );

  const handleSaveContextMenu = useCallback(
    ( event: MouseEvent ) => {
      if ( !automaton ) { return; }

      if ( automaton.saveContextMenuCommands ) {
        event.preventDefault();
        event.stopPropagation();

        dispatch( {
          type: 'ContextMenu/Open',
          position: { x: event.clientX, y: event.clientY },
          commands: automaton.saveContextMenuCommands
        } );
      }
    },
    [ automaton ]
  );

  const undoText = useMemo(
    () => (
      historyIndex !== 0
        ? 'Undo: ' + historyEntries[ historyIndex - 1 ].description
        : 'Can\'t Undo'
    ),
    [ historyIndex, historyEntries ]
  );

  const redoText = useMemo(
    () => (
      historyIndex !== historyEntries.length
        ? 'Redo: ' + historyEntries[ historyIndex ].description
        : 'Can\'t Redo'
    ),
    [ historyIndex, historyEntries ]
  );

  return (
    <Root className={ className }>
      <Section>
        { !isDisabledTimeControls && (
          <Button
            as={ isPlaying ? Icons.Pause : Icons.Play }
            active={ 1 as any as boolean } // fuck
            onClick={ handlePlay }
            data-stalker="Play / Pause"
          />
        ) }
        <StyledHeaderSeekbar />
      </Section>
      <Section>
        <Logo as={ Icons.Automaton }
          onClick={ () => dispatch( { type: 'About/Open' } ) }
          data-stalker={ `Automaton v${ process.env.VERSION! }` }
        />
        <StyledShouldSaveIndicator />
      </Section>
      <Section>
        <Button
          as={ Icons.Undo }
          onClick={ handleUndo }
          disabled={ historyIndex === 0 }
          data-stalker={ undoText }
        />
        <Button
          as={ Icons.Redo }
          onClick={ handleRedo }
          disabled={ historyIndex === historyEntries.length }
          data-stalker={ redoText }
        />
        <Button
          as={ Icons.Snap }
          onClick={ () => {
            dispatch( {
              type: 'Settings/ChangeMode',
              mode: settingsMode === 'snapping' ? 'none' : 'snapping'
            } );
          } }
          active={ ( settingsMode === 'snapping' ? 1 : 0 ) as any as boolean } // fuck
          data-stalker="Snapping"
        />
        <Button
          as={ Icons.Cog }
          onClick={ () => {
            dispatch( {
              type: 'Settings/ChangeMode',
              mode: settingsMode === 'general' ? 'none' : 'general'
            } );
          } }
          active={ ( settingsMode === 'general' ? 1 : 0 ) as any as boolean } // fuck
          data-stalker="General Settings"
        />
        <Button as={ Icons.Save }
          onClick={ handleSave }
          onContextMenu={ handleSaveContextMenu }
          data-stalker={ isSavedRecently ? 'Copied to clipboard!' : 'Save' }
        />
      </Section>
    </Root>
  );
};

export { Header };
