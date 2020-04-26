import React, { useCallback } from 'react';
import { ToastyKind, closeToasty } from '../states/Toasty';
import styled, { css, keyframes } from 'styled-components';
import { Colors } from '../constants/Colors';
import { Icons } from '../icons/Icons';
import { useDispatch } from '../states/store';

// == styles =======================================================================================
const Content = styled.div`
`;

const Icon = styled.img`
  width: 24px;
  height: 24px;
  flex-shrink: 0;
  margin-right: 8px;
`;

const openingKeyframes = keyframes`
  0% {
    opacity: 0.0;
    transform: scale( 0.9 );
  }

  100% {
  }
`;

const closingKeyframes = keyframes`
  0% {
  }

  100% {
    opacity: 0.0;
    transform: scale( 0.9 );
  }
`;

const Root = styled.div<{ kind: ToastyKind; closing: boolean }>`
  position: relative;
  display: flex;
  right: 0;
  top: 0;
  width: calc( 100% - 16px );
  margin: 8px;
  padding: 8px;
  font-size: 12px;
  background: ${ Colors.back2 };
  box-shadow: ${ ( { kind } ) => (
    kind === ToastyKind.Error ? `0 0 0 1px ${ Colors.error }` :
    kind === ToastyKind.Warning ? `0 0 0 1px ${ Colors.warning }` :
    kind === ToastyKind.Info ? `0 0 0 1px ${ Colors.info }` :
    'none'
  ) };
  filter: drop-shadow( 0 0 2px ${ Colors.black } );
  pointer-events: auto;
  cursor: pointer;
  ${ ( { closing } ) => (
    closing
      ? css`animation: 0.2s cubic-bezier(0.2, 0.0, 0.0, 1.0) ${ closingKeyframes };`
      : css`animation: 0.2s cubic-bezier(0.2, 0.0, 0.0, 1.0) ${ openingKeyframes };`
  ) }
  animation-fill-mode: forwards;

  &:active {
    background: ${ Colors.back1 };
  }
`;

// == component ====================================================================================
const ToastyEntry = ( { id, kind, message, closing }: {
  id: string;
  kind: ToastyKind;
  message: string;
  closing: boolean;
} ): JSX.Element | null => {
  const dispatch = useDispatch();

  const icon = (
    kind === ToastyKind.Error ? Icons.Error :
    kind === ToastyKind.Warning ? Icons.Warning :
    kind === ToastyKind.Info ? Icons.Info :
    null
  );

  const handleClick = useCallback(
    () => closeToasty( { id, dispatch } ),
    [ id ]
  );

  return (
    <Root
      kind={ kind }
      closing={ ( closing ? 1 : 0 ) as any as boolean } // fuck
      onClick={ handleClick }
    >
      { icon && <Icon as={ icon } /> }
      <Content>
        { message }
      </Content>
    </Root>
  );
};

export { ToastyEntry };
