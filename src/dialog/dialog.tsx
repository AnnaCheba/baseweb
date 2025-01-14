/*
Copyright (c) Uber Technologies, Inc.

This source code is licensed under the MIT license found in the
LICENSE file in the root directory of this source tree.
*/
import React, { isValidElement } from 'react';
import type { ReactNode, ComponentType } from 'react';

import { useStyletron } from '../styles/index';
import { getOverrides } from '../helpers/overrides';
import { ButtonDock } from '../button-dock';
import { Button, KIND, SHAPE } from '../button';
import { Delete } from '../icon';
import { StyledHeading, StyledBody, StyledRoot, StyledScrollContainer } from './styled-components';
import { PLACEMENT, SIZE } from './constants';
import type { DialogProps, Artwork } from './types';

function renderArtwork(artwork: Artwork): ReactNode {
  if (isValidElement(artwork)) {
    return artwork;
  } else if (typeof artwork === 'function') {
    const ArtworkComponent = artwork as ComponentType;
    return <ArtworkComponent />;
  }
  return null;
}

const DefaultDismissButton = (props) => {
  const overrides = {
    BaseButton: {
      style: {
        position: 'absolute',
        top: '16px',
        right: '8px',
        // this will be tokenized in the future
        backgroundColor: 'rgba(255, 255, 255, 0.6)',
        zIndex: 1,
      },
    },
  };
  return (
    <Button kind={KIND.secondary} shape={SHAPE.circle} overrides={overrides} {...props}>
      <Delete size={36} />
    </Button>
  );
};

const DefaultButtonDock = (props) => {
  const [, theme] = useStyletron();
  const overrides = {
    Root: {
      style: {
        paddingRight: theme.sizing.scale800,
        paddingLeft: theme.sizing.scale800,
        marginBottom: theme.sizing.scale800,
      },
    },
  };
  return <ButtonDock overrides={overrides} {...props} />;
};

const Dialog = ({
  artwork,
  buttonDock,
  children,
  handleDismiss,
  showDismissButton = true,
  hasOverlay = true,
  heading,
  isOpen,
  overrides = {},
  placement = PLACEMENT.center,
  numHeadingLines = 2,
  size = SIZE.xSmall,
}: DialogProps) => {
  const [Root, rootProps] = getOverrides(overrides.Root, StyledRoot);
  const [ScrollContainer, scrollContainerProps] = getOverrides(
    overrides.ScrollContainer,
    StyledScrollContainer
  );
  const [Heading, headingProps] = getOverrides(overrides.Heading, StyledHeading);
  const [Body, bodyProps] = getOverrides(overrides.Body, StyledBody);
  const [ButtonDock, buttonDockProps] = getOverrides(overrides.ButtonDock, DefaultButtonDock);
  const [DismissButton, dismissButtonProps] = getOverrides(
    overrides.DismissButton,
    DefaultDismissButton
  );

  const dialogRef = React.useRef(null);

  React.useEffect(() => {
    if (isOpen) {
      if (hasOverlay) {
        // @ts-expect-error todo(ts-migration) TS18047 'dialogRef.current' is possibly 'null'.
        dialogRef.current.showModal();
      } else {
        // @ts-expect-error todo(ts-migration) TS18047 'dialogRef.current' is possibly 'null'.
        dialogRef.current.show();
      }
    } else {
      // @ts-expect-error todo(ts-migration) TS18047 'dialogRef.current' is possibly 'null'.
      dialogRef.current.close();
    }
  }, [isOpen, hasOverlay]);

  function handleOutsideClick(e) {
    // @ts-expect-error todo(ts-migration) TS18047 'dialogRef.current' is possibly 'null'.
    if (!dialogRef.current.contains(e.target) || e.target.nodeName === 'DIALOG') {
      // @ts-expect-error todo(ts-migration) TS2722 Cannot invoke an object which is possibly 'undefined'.
      handleDismiss();
    }
  }

  function handleEscapeKey(e) {
    if (e.key === 'Escape') {
      // @ts-expect-error todo(ts-migration) TS2722 Cannot invoke an object which is possibly 'undefined'.
      handleDismiss();
    }
  }

  React.useEffect(() => {
    if (isOpen) {
      // No delay, just pushing it to the end of the call stack so that the
      // Dialog doesn't close immediately after opening via click event
      const timer = setTimeout(() => {
        document.addEventListener('click', handleOutsideClick);
      }, 0);
      document.addEventListener('keydown', handleEscapeKey);

      return () => {
        clearTimeout(timer);
        document.removeEventListener('click', handleOutsideClick);
        document.removeEventListener('keydown', handleEscapeKey);
      };
    } else {
      document.removeEventListener('click', handleOutsideClick);
      document.removeEventListener('keydown', handleEscapeKey);
    }
  }, [isOpen]);

  return (
    <Root ref={dialogRef} $isOpen={isOpen} $size={size} $placement={placement} {...rootProps}>
      {handleDismiss && showDismissButton && (
        <DismissButton onClick={() => handleDismiss()} {...dismissButtonProps} />
      )}

      <ScrollContainer {...scrollContainerProps} tabIndex={0}>
        {/* @ts-expect-error todo(ts-migration) TS2345 Argument of type 'Artwork | undefined' is not assignable to parameter of type 'Artwork'. */}
        {renderArtwork(artwork)}
        <Heading $numHeadingLines={numHeadingLines} {...headingProps}>
          {heading}
        </Heading>
        <Body {...bodyProps}>{children}</Body>
      </ScrollContainer>

      {buttonDock && <ButtonDock {...buttonDock} {...buttonDockProps} />}
    </Root>
  );
};
export default Dialog;
