/// <reference types="react" />
declare module "src/common/event/eventEmitter" {
    export interface ListenerEventContext {
        stopDelivery: () => void;
    }
    export class EventEmitter {
        private _events;
        count(name: string): number;
        emit(name: string, ...args: any[]): void;
        subscribe(name: string | string[], listener: Function): void;
        unsubscribe(name: string | string[], listener?: Function): void;
        deleteEvent(name: string, listener?: Function): void;
        assignEvent<T>(name: string, listener: Function): void;
    }
}
declare module "src/common/event/eventBus" {
    import { EventEmitter } from "src/common/event/eventEmitter";
    export const EventBus: EventEmitter;
    export abstract class GlobalEvent {
        /**
         * Subscribe the service event
         * @param name Event name
         * @param listener Listener function
         */
        subscribe(name: string | string[], listener: Function): void;
        /**
         * Emit the service event
         * @param name Event name
         * @param args Arguments
         */
        emit(name: string, ...args: any): void;
        /**
         * Count the service event
         * @param name Event name
         */
        count(name: string): number;
        /**
         * Unsubscribe the specific event and the listener function
         * @param name The event name
         * @param listener optional, it unsubscribes events via name if not pass the listener function
         */
        unsubscribe(name: any, listener?: Function): void;
    }
}
declare module "src/common/event/decorator" {
    /**
     * Emit decorator, when the function be called,
     * it's going to notify the listener
     * @param name Event name
     */
    export function emit(name: string): (target: any, property: string, descriptor: PropertyDescriptor) => PropertyDescriptor;
    /**
     * When the event emitted, it's going to call target function
     * @param name Event name
     */
    export function subscribe(name: string | string[]): (target: any, property: string, descriptor: PropertyDescriptor) => PropertyDescriptor;
}
declare module "src/common/event/index" {
    export * from "src/common/event/decorator";
    export * from "src/common/event/eventBus";
    export * from "src/common/event/eventEmitter";
}
declare module "src/react/component" {
    import { GlobalEvent } from "src/common/event/index";
    export enum ComponentEvents {
        Update = "Component.Update"
    }
    export interface IComponent<S = any> {
        /**
         * Set the Component state
         * @param values The next values of state
         * @param callback calling after setState
         */
        setState(values: S, callback?: (prevState: S, nextState: S) => void): void;
        /**
         * Trigger the Component update event
         * @param nextState
         */
        render(nextState?: S): void;
        /**
         * Listen to the Component state update event
         * @param listener
         */
        onUpdateState(listener: (prevState: S, nextState: S) => void): void;
        /**
         * Remove the Component update event listening, default is remove all,
         * also you can remove one by pass the listener
         */
        removeOnUpdateState(listener?: Function): void;
        /**
         * Force to update the Component
         */
        forceUpdate(): void;
        /**
         * Get the Component state
         */
        getState(): S;
    }
    export abstract class Component<S = any> extends GlobalEvent implements IComponent<S> {
        protected abstract state: S;
        private _event;
        constructor();
        /**
         * Set the state values, and notify the view component to re render
         * @param values update target state values
         */
        setState(values: Partial<S>, callback?: (prevState: S, nextState: S) => void): void;
        /**
         * Initiative notify the component to render the view by the state
         * @param nextState
         */
        render(nextState?: S): void;
        onUpdateState(listener: (prevState: S, nextState: S) => void): void;
        removeOnUpdateState(listener?: Function): void;
        forceUpdate(): void;
        getState(): S;
    }
}
declare module "src/react/helper" {
    /**
     * Clone react children props
     * @param children React.ReactNode
     * @param props Parent props
     */
    export function cloneReactChildren<P>(children: React.ReactNode, props: P): React.ReactNode;
}
declare module "src/common/logger" {
    const _default: {
        info(...args: any[]): void;
        error(...args: any[]): void;
        warn(...args: any[]): void;
    };
    export default _default;
}
declare module "src/react/controller" {
    import { GlobalEvent } from "src/common/event/index";
    export abstract class Controller extends GlobalEvent {
        abstract initView(): void;
    }
}
declare module "src/react/connector" {
    import 'reflect-metadata';
    import React from 'react';
    import { IComponent } from "src/react/component";
    import { Controller } from "src/react/controller";
    export type ServiceObject = {
        [index: string]: IComponent;
    };
    export type ControllerObject = {
        [index: string]: Controller;
    };
    export function connect<T = any>(Service: IComponent | ServiceObject, View: React.ComponentType<any>, Controller?: Controller | ControllerObject): React.ComponentType<T>;
}
declare module "src/react/index" {
    export * from "src/react/component";
    export * from "src/react/helper";
    export * from "src/react/connector";
    export * from "src/react/controller";
}
declare module "src/common/const" {
    /**
     * Default App prefix
     */
    export const APP_PREFIX = "mo";
}
declare module "src/common/className" {
    /**
     * This function help you prefix a css class name, default is molecule.
     * Example: prefixClaName('test') will return 'molecule-test',
     * prefixClaName('test', 'c') will return 'c-test'
     * @param name Default class name
     * @param prefix The prefix of class name you want to append
     */
    export function prefixClaName(name: string, prefix?: string): string;
    export function classNames(...args: any[]): string;
    /**
     * Element names may consist of Latin letters, digits, dashes and underscores.
     * CSS class is formed as block name plus two underscores plus element name: .block__elem
     * @param block
     * @param element
     */
    export function getBEMElement(block: string, element: string): string;
    /**
     * CSS class is formed as block’s or element’s name plus two dashes:
     * .block--mod or .block__elem--mod and .block--color-black with .block--color-red.
     * Spaces in complicated modifiers are replaced by dash.
     * @param blockOrElement
     * @param modifier
     */
    export function getBEMModifier(blockOrElement: string, modifier: string): string;
    /**
     * Returns the className of font-family in mac
     * @returns
     */
    export function getFontInMac(): "" | "mac";
}
declare module "src/common/dom" {
    export type HTMLElementType = HTMLElement | null;
    export type TriggerEvent = 'click' | 'contextmenu' | 'hover';
    /**
     * specify `rightBottom` means align to the bottom and keep in right
     */
    export type PlacementType = 'top' | 'right' | 'bottom' | 'left' | 'rightBottom';
    export const select: any;
    export const selectAll: any;
    export interface IPosition {
        x: number;
        y: number;
    }
    /**
     * Get Document Rectangle info
     */
    export function getDocumentRect(): {
        height: number;
        width: number;
        clientWidth: number;
        clientHeight: number;
    };
    /**
     * Returns the position of element relative to element position
     * @param element target element
     * @param relativePos the relative element position
     */
    export function getRelativePosition(element: HTMLElement, relativePos: IPosition): {
        x: number;
        y: number;
    };
    export function getEventPosition(e: React.MouseEvent): {
        x: number;
        y: number;
    };
    export function findParentByClassName<T>(element: any, className: any): T | null;
    export function triggerEvent(trigger: TriggerEvent): "onClick" | "onMouseOver" | "onContextMenu";
    /**
     * Get the element position by placement and DOMRect
     * @param placement top | right | bottom | left
     * @param domRect Dom rect info, normally get it from getBoundingClientRect function
     */
    export function getPositionByPlacement(placement: PlacementType, domRect: DOMRect): IPosition;
    export function getAttr(domElement: HTMLElement, attr: any): string;
    /**
     * Get an element the center coords
     * @param element HTMLElement
     * @returns
     */
    export function getElementClientCenter(element: HTMLElement): {
        x: number;
        y: number;
    };
    /**
     * Get the data-* attributions from props
     * @param props
     * @returns
     */
    export function getDataAttributionsFromProps(props: Record<string, any>): Record<string, any>;
}
declare module "src/react/render" {
    import { Root } from 'react-dom/client';
    export const renderedSign: unique symbol;
    export const render: (node: JSX.Element, container: HTMLElement & {
        [renderedSign]?: Root;
    }) => void;
    export const unmout: (container: HTMLElement & {
        [renderedSign]?: Root;
    }) => boolean;
}
declare module "src/components/contextView/base" {
    export const contextViewClass: string;
    export const contentClassName: string;
    export const blockClassName: string;
    export const shadowClassName: string;
}
declare module "src/components/contextView/index" {
    import React from 'react';
    import { HTMLElementType, IPosition } from "src/common/dom";
    export interface IContextViewProps {
        /**
         * Default true
         */
        shadowOutline?: boolean;
        render?: () => React.ReactNode;
    }
    export interface IContextView {
        view: HTMLElementType;
        show(anchorPos: IPosition, render?: () => React.ReactNode): void;
        hide(): void;
        onHide(callback?: Function): void;
        dispose(): void;
    }
    /**
     * It's a hook used in functional component
     */
    export function useContextViewEle(props?: IContextViewProps): IContextView;
    /**
     * TODO: It's not a hook, don't begin with use
     */
    export function useContextView(props?: IContextViewProps): IContextView;
}
declare module "src/components/contextMenu/index" {
    import React from 'react';
    import { HTMLElementType } from "src/common/dom";
    import { IContextView } from "src/components/contextView/index";
    export interface IContextMenuProps {
        anchor: HTMLElementType;
        render: () => React.ReactNode;
    }
    export interface IContextMenu extends IContextView {
    }
    export function useContextMenu(props: IContextMenuProps): IContextMenu | undefined;
}
declare module "src/common/utils" {
    export function searchById(id: any): (item: any) => boolean;
    /**
     * Clone a new object by an object instance
     * @param origin Original object instance
     */
    export function cloneInstance<T>(origin: T): any;
    /**
     * Merge multiple functions to one function
     * @param funcs
     */
    export function mergeFunctions(...funcs: any[]): (...args: any[]) => void;
    export function randomId(): number;
    export function mergeObjects<T>(source: object, target: object): T;
    /**
     * It's converts an object to a flatted object,
     * eg: { a: { b: 'test' }}, result is : { 'a.b': 'test' }
     * @param target flat target
     */
    export function flatObject(target: object): object;
    /**
     * It's converts a flatted object to a normal object,
     *  eg: { 'a.b': 'test' }, result is : { a: { b: 'test' }}
     * @param target flat target
     */
    export function normalizeFlattedObject(target: object): object;
    /**
     * Determine if a color is light or dark.
     * @param color HEX or RGB
     */
    export function colorLightOrDark(color: string): "light" | "dark";
}
declare module "src/common/css" {
    /**
     * px = em * parentElementFontSize
     * @param em em value
     */
    export function em2Px(em: number, fontSize: number): number;
    /**
     * Apply css content to workbench
     * @param styleSheetContent CSS sheet content
     * @param rulesClassName Style tag class Name
     */
    export function applyStyleSheetRules(styleSheetContent: string, rulesClassName: string): void;
}
declare module "src/components/menu/base" {
    export const defaultMenuClassName: string;
    export const defaultSubMenuClassName: string;
    export const verticalMenuClassName: string;
    export const horizontalMenuClassName: string;
    export const defaultMenuItemClassName: string;
    export const defaultDividerClassName: string;
    export const checkClassName: string;
    export const disabledClassName: string;
    export const activeClassName: string;
    export const labelClassName: string;
    export const menuContentClassName: string;
    export const keybindingClassName: string;
    export const indicatorClassName: string;
}
declare module "src/components/menu/divider" {
    import React from 'react';
    const Divider: () => React.JSX.Element;
    export { Divider };
}
declare module "src/common/types" {
    export interface HTMLElementProps {
        title?: string;
        style?: React.CSSProperties;
        className?: string;
        role?: string;
    }
    export type UniqueId = string | number;
}
declare module "src/components/icon/index" {
    import React from 'react';
    import '@vscode/codicons/dist/codicon.css';
    import { ComponentProps } from 'react';
    export interface IIconProps extends ComponentProps<'span'> {
        type?: string | JSX.Element;
        onClick?: (e: React.MouseEvent) => void;
    }
    export function Icon(props: React.PropsWithChildren<IIconProps>): React.JSX.Element;
}
declare module "src/components/menu/menuItem" {
    import React from 'react';
    import type { HTMLElementProps, UniqueId } from "src/common/types";
    export interface IMenuItemProps extends HTMLElementProps {
        id: UniqueId;
        /**
         * The name of icon
         */
        icon?: string | JSX.Element;
        type?: 'divider';
        /**
         * Item Name
         */
        name?: string;
        disabled?: boolean;
        /**
         * The description of keybinding
         * example: ⇧⌘P
         */
        keybinding?: string;
        /**
         * Custom render
         */
        render?: (data: IMenuItemProps) => React.ReactNode;
        onClick?: (e: React.MouseEvent, item: IMenuItemProps) => void;
        sortIndex?: number;
        [key: string]: any;
    }
    export function MenuItem(props: React.PropsWithChildren<Omit<IMenuItemProps, 'id'>>): React.JSX.Element;
}
declare module "src/components/menu/subMenu" {
    import React from 'react';
    import { TriggerEvent } from "src/common/dom";
    import { IMenuItemProps } from "src/components/menu/menuItem";
    export enum MenuMode {
        Vertical = "vertical",
        Horizontal = "horizontal"
    }
    export function isHorizontal(mode: MenuMode): boolean;
    export function isVertical(mode: MenuMode): boolean;
    export interface ISubMenuProps extends Omit<IMenuItemProps, 'id'> {
        /**
         * The event of show subMenu, default value is 'hover'
         */
        trigger?: TriggerEvent;
        icon?: string | JSX.Element;
        data?: ISubMenuProps[];
        mode?: MenuMode;
    }
    export function SubMenu(props: React.PropsWithChildren<ISubMenuProps>): React.JSX.Element;
}
declare module "src/components/menu/menu" {
    import React from 'react';
    import { ISubMenuProps } from "src/components/menu/subMenu";
    export type IMenuProps = ISubMenuProps;
    export type MenuRef = {
        dispose: () => void;
    };
    export const Menu: React.ForwardRefExoticComponent<Omit<React.PropsWithChildren<ISubMenuProps>, "ref"> & React.RefAttributes<MenuRef>>;
}
declare module "src/components/menu/index" {
    export * from "src/components/menu/menu";
    export * from "src/components/menu/menuItem";
    export * from "src/components/menu/subMenu";
}
declare module "src/components/tooltip/index" {
    import React from 'react';
    import 'rc-tooltip/assets/bootstrap.css';
    import type { TooltipProps } from 'rc-tooltip/lib/Tooltip';
    export interface IToolTipProps extends TooltipProps {
    }
    const Tooltip: ({ overlay, children, placement, trigger, overlayClassName, mouseEnterDelay, ...rest }: IToolTipProps) => React.JSX.Element;
    export default Tooltip;
}
declare module "src/components/actionBar/index" {
    import React from 'react';
    import { IMenuItemProps } from "src/components/menu/index";
    import type { HTMLElementProps, UniqueId } from "src/common/types";
    export interface IActionBarItemProps<T = any> {
        id: UniqueId;
        title?: string | JSX.Element;
        name?: React.ReactNode;
        icon?: string | JSX.Element;
        disabled?: boolean;
        checked?: boolean;
        data?: T;
        contextMenu?: IMenuItemProps[];
        onContextMenuClick?: (e: React.MouseEvent, item: IMenuItemProps | undefined) => void;
        onClick?(event: React.MouseEvent, item: IActionBarItemProps): void;
        [key: string]: any;
    }
    export interface IActionBarProps<T = any> extends HTMLElementProps {
        data: IActionBarItemProps<T>[];
        onContextMenuClick?: (e: React.MouseEvent, item: IMenuItemProps | undefined) => void;
        onClick?(event: React.MouseEvent, item: IActionBarItemProps): void;
        [key: string]: any;
    }
    export function ActionBarItem(props: IActionBarItemProps): React.JSX.Element;
    export function ActionBar<T = any>(props: IActionBarProps<T>): React.JSX.Element;
}
declare module "src/components/breadcrumb/base" {
    export const defaultBreadcrumbClassName: string;
    export const breadcrumbItemClassName: string;
    export const breadcrumbLabelClassName: string;
}
declare module "src/components/breadcrumb/index" {
    import React from 'react';
    import type { UniqueId, HTMLElementProps } from "src/common/types";
    export interface IBreadcrumbItemProps extends HTMLElementProps {
        id: UniqueId;
        href?: string;
        name?: string;
        icon?: string | JSX.Element;
        render?(item: IBreadcrumbItemProps): React.ReactNode;
        [key: string]: any;
    }
    export interface IBreadcrumbProps extends HTMLElementProps {
        routes: IBreadcrumbItemProps[];
        separator?: React.ReactNode;
        onClick?(event: React.MouseEvent, item?: IBreadcrumbItemProps): void;
        [key: string]: any;
    }
    export function Breadcrumb(props: IBreadcrumbProps): React.JSX.Element;
}
declare module "src/components/button/index" {
    import React from 'react';
    type BtnSizeType = 'normal' | 'large';
    export interface IButtonProps extends Omit<React.ComponentProps<'button'>, 'ref'> {
        disabled?: boolean;
        size?: BtnSizeType;
        onClick?(event: React.MouseEvent): void;
    }
    export const defaultButtonClassName: string;
    export const normalButtonClassName: string;
    export const largeButtonClassName: string;
    export const disableButtonClassName: string;
    export const Button: React.ForwardRefExoticComponent<IButtonProps & {
        children?: React.ReactNode;
    } & React.RefAttributes<HTMLButtonElement>>;
}
declare module "src/components/checkbox/checkbox" {
    import React from 'react';
    import type { HTMLElementProps, UniqueId } from "src/common/types";
    export interface ICheckboxProps extends HTMLElementProps {
        id: UniqueId;
        value?: string;
        children?: React.ReactNode;
        onChange?(e: React.ChangeEvent, options?: ICheckboxProps): void;
        [key: string]: any;
    }
    export const checkboxClassName: string;
    export function Checkbox(props: ICheckboxProps): React.JSX.Element;
}
declare module "src/components/checkbox/index" {
    export * from "src/components/checkbox/checkbox";
}
declare module "src/components/collapse/base" {
    export const defaultCollapseClassName: string;
    export const collapseItemClassName: string;
    export const collapsePaneClassName: string;
    export const collapsingClassName: string;
    export const collapseActiveClassName: string;
    export const collapseHeaderClassName: string;
    export const collapseTitleClassName: string;
    export const collapseContentClassName: string;
    export const collapseExtraClassName: string;
}
declare module "src/components/toolbar/index" {
    import React from 'react';
    import { IActionBarProps } from "src/components/actionBar/index";
    export interface IToolbarProps<T = any> extends IActionBarProps {
    }
    export const toolbarClassName: string;
    export function Toolbar<T = any>(props: IToolbarProps<T>): React.JSX.Element;
}
declare module "src/components/split/pane" {
    import React, { PropsWithChildren } from 'react';
    import type { HTMLElementProps } from "src/common/types";
    interface IPaneProps extends HTMLElementProps {
    }
    export interface IPaneConfigs {
        maxSize?: number | string;
        minSize?: number | string;
    }
    export default function Pane({ children, style, className, role, title, }: PropsWithChildren<IPaneProps & IPaneConfigs>): React.JSX.Element;
}
declare module "src/components/split/base" {
    export const splitClassName: string;
    export const splitDraggingClassName: string;
    export const splitVerticalClassName: string;
    export const splitHorizontalClassName: string;
    export const paneItemClassName: string;
    export const sashItemClassName: string;
    export const sashVerticalClassName: string;
    export const sashHorizontalClassName: string;
    export const sashDisabledClassName: string;
    export const sashHoverClassName: string;
}
declare module "src/components/split/sash" {
    import React, { CSSProperties } from 'react';
    interface ISashProps {
        className?: string;
        style: CSSProperties;
        onDragStart: React.MouseEventHandler<HTMLDivElement>;
        onDragging: React.MouseEventHandler<HTMLDivElement>;
        onDragEnd: React.MouseEventHandler<HTMLDivElement>;
    }
    export default function Sash({ className, onDragStart, onDragging, onDragEnd, ...restProps }: ISashProps): React.JSX.Element;
}
declare module "src/components/split/SplitPane" {
    import React from 'react';
    import { HTMLElementProps } from "src/common/types";
    export interface ISplitProps extends HTMLElementProps {
        children: JSX.Element[];
        /**
         * Should allowed to resized
         *
         * default is true
         */
        allowResize?: boolean | boolean[];
        /**
         * Should show the sashes
         *
         * default is true
         */
        showSashes?: boolean | boolean[];
        /**
         * How to split the space
         *
         * default is vertical
         */
        split?: 'vertical' | 'horizontal';
        /**
         * Only support controlled mode, so it's required
         */
        sizes: (string | number)[];
        onChange: (sizes: number[]) => void;
        className?: string;
        sashClassName?: string;
        paneClassName?: string;
        /**
         * Specify the size fo resizer
         *
         * defualt size is 4px
         */
        resizerSize?: number;
    }
    const SplitPane: ({ children, sizes: propSizes, allowResize: propAllowResize, showSashes, split, className, sashClassName, paneClassName, resizerSize, onChange, ...restProps }: ISplitProps) => React.JSX.Element;
    export default SplitPane;
}
declare module "src/components/split/index" {
    export * from "src/components/split/SplitPane";
    export * from "src/components/split/pane";
    export { default } from "src/components/split/SplitPane";
    export { default as Pane } from "src/components/split/pane";
}
declare module "src/components/collapse/index" {
    import React from 'react';
    import { HTMLElementProps, UniqueId } from "src/common/types";
    import { IActionBarItemProps } from "src/components/actionBar/index";
    type RenderFunctionProps = (data: ICollapseItem) => React.ReactNode;
    export interface ICollapseItem extends HTMLElementProps {
        id: UniqueId;
        name: string;
        hidden?: boolean;
        toolbar?: IActionBarItemProps[];
        renderPanel?: RenderFunctionProps;
        config?: {
            /**
             * Specify how much of the remaining space should be assigned to the item, default is 1
             *
             * It unfolds in its own content height or the `MAX_GROW_HEIGHT` rather than in calculated height
             */
            grow?: number;
        };
        [key: string]: any;
    }
    export interface ICollapseProps extends HTMLElementProps {
        activePanelKeys?: UniqueId[];
        data?: ICollapseItem[];
        onCollapseChange?: (keys: UniqueId[]) => void;
        onResize?: (resizes: number[]) => void;
        onToolbarClick?: (item: IActionBarItemProps, parentPanel: ICollapseItem) => void;
        [key: string]: any;
    }
    /**
     * It's the max height for the item which set the grow to 0
     */
    export const MAX_GROW_HEIGHT = 220;
    export const HEADER_HEIGTH = 26;
    export function Collapse({ data, activePanelKeys: controlActivePanelKeys, className, title, style, role, onCollapseChange, onToolbarClick, onResize, ...restProps }: ICollapseProps): React.JSX.Element;
}
declare module "src/components/dialog/base" {
    import { ConfrimType } from "src/components/dialog/index";
    export const modalClassName: string;
    export const confirmClassName: string;
    export const closeDialogClassName: string;
    export const closeDialogDescriptorClassName: string;
    export const wrapDialogClassName: string;
    export const containerConfirmClassName: string;
    export const indicatorConfirmClassName: string;
    export const iconConfirmClassName: (type?: ConfrimType) => string;
    export const contentConfirmClassName: string;
    export const messageConfirmClassName: string;
    export const btnsConfirmClassName: string;
    export const centeredConfirmClassName: string;
    export const textConfirmClassName: string;
    export const detailConfirmClassName: string;
}
declare module "src/components/dialog/modal" {
    import React from 'react';
    import { IDialogPropTypes } from 'rc-dialog/lib/IDialogPropTypes';
    import { ConfrimType } from "src/components/dialog/index";
    import { IButtonProps } from "src/components/button/index";
    export interface IModalProps extends IDialogPropTypes {
        onOk?: (e: React.MouseEvent<HTMLElement>) => void;
        onCancel?: (e: React.SyntheticEvent<Element, Event>) => void;
        centered?: boolean;
        cancelText?: React.ReactNode;
        okText?: React.ReactNode;
        okButtonProps?: IButtonProps;
        cancelButtonProps?: IButtonProps;
        okCancel?: boolean;
    }
    export interface IModalFuncProps extends IDialogPropTypes {
        cancelText?: React.ReactNode;
        okText?: React.ReactNode;
        icon?: string | JSX.Element;
        content?: React.ReactNode;
        onOk?: (...args: any[]) => any;
        onCancel?: (...args: any[]) => void;
        okButtonProps?: IButtonProps;
        cancelButtonProps?: IButtonProps;
        centered?: boolean;
        okCancel?: boolean;
        type?: ConfrimType;
    }
    export const destroyFns: Array<() => void>;
    export const Modal: React.FC<IModalProps>;
}
declare module "src/components/dialog/actionButton" {
    import React from 'react';
    import { IButtonProps } from "src/components/button/index";
    export interface ActionButtonProps {
        actionFn?: (...args: any[]) => any | PromiseLike<any>;
        close?: Function;
        buttonProps?: IButtonProps;
        children?: React.ReactNode;
    }
    const ActionButton: React.FC<ActionButtonProps>;
    export default ActionButton;
}
declare module "src/components/dialog/confirmDialog" {
    import React from 'react';
    import { IModalFuncProps } from "src/components/dialog/modal";
    interface ConfirmDialogProps extends IModalFuncProps {
        afterClose?: () => void;
        close: (...args: any[]) => void;
        actions?: React.ReactNode;
    }
    const ConfirmDialog: (props: ConfirmDialogProps) => React.JSX.Element;
    export default ConfirmDialog;
}
declare module "src/components/dialog/confirm" {
    import { IModalFuncProps } from "src/components/dialog/modal";
    export type ModalFunc = (props: IModalFuncProps) => {
        destroy: () => void;
    };
    export interface ModalStaticFunctions {
        warn: ModalFunc;
        warning: ModalFunc;
        confirm: ModalFunc;
    }
    export default function confirm(config: IModalFuncProps): {
        destroy: (...args: any[]) => void;
    };
    export function withWarn(props: IModalFuncProps): IModalFuncProps;
    export function withConfirm(props: IModalFuncProps): IModalFuncProps;
}
declare module "src/components/dialog/index" {
    import { Modal as OriginModal, IModalProps, IModalFuncProps } from "src/components/dialog/modal";
    import { ModalStaticFunctions } from "src/components/dialog/confirm";
    type ModalType = typeof OriginModal & ModalStaticFunctions & {
        destroyAll: () => void;
    };
    const Modal: ModalType;
    export enum ConfirmState {
        warning = "warning",
        confirm = "confirm"
    }
    export type ConfrimType = keyof typeof ConfirmState;
    export { Modal };
    export type { IModalFuncProps, IModalProps };
}
declare module "src/components/dropdown/index" {
    import React from 'react';
    import { TriggerEvent, PlacementType } from "src/common/dom";
    export interface IDropDownProps extends React.ComponentProps<'div'> {
        overlay: React.ReactNode;
        trigger?: TriggerEvent;
        placement?: PlacementType;
    }
    export type DropDownRef = {
        dispose: () => void;
    };
    export const defaultDropDownClassName: string;
    export const DropDown: React.ForwardRefExoticComponent<Omit<IDropDownProps, "ref"> & React.RefAttributes<DropDownRef>>;
}
declare module "src/common/keyCodes" {
    export enum KeyCodes {
        ENTER = "Enter"
    }
}
declare module "src/components/input/textArea" {
    import React from 'react';
    import { TextAreaProps } from 'rc-textarea';
    export interface ITextAreaProps extends TextAreaProps {
        showCount?: boolean;
        maxLength?: number;
        onChange?: (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => void;
    }
    export const TextArea: ({ showCount, maxLength, className, style, onChange, ...props }: ITextAreaProps) => React.JSX.Element;
}
declare module "src/components/input/input" {
    import React from 'react';
    import { TextArea } from "src/components/input/textArea";
    type SizeType = 'normal' | 'large';
    export interface IInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size' | 'onChange' | 'onKeyDown' | 'onPressEnter'> {
        disabled?: boolean;
        size?: SizeType;
        type?: LiteralUnion<'button' | 'checkbox' | 'search' | 'submit' | 'text', string>;
        placeholder?: string;
        value?: string;
        style?: React.CSSProperties;
        defaultValue?: string;
        className?: string;
        onPressEnter?: React.KeyboardEventHandler<HTMLInputElement>;
        onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
        onChange?: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    }
    export const inputClassName: string;
    export const normalClassName: string;
    export const largetClassName: string;
    export const disabledClassName: string;
    export function fixControlledValue<T>(value: T): "" | T;
    export function resolveOnChange(_: HTMLInputElement | HTMLTextAreaElement | null, e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement> | React.MouseEvent<HTMLElement, MouseEvent>, onChange?: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void): void;
    export function getInputClassName(size?: SizeType, disabled?: boolean): string;
    export interface InputState {
        value: any;
        prevValue: any;
    }
    export class Input extends React.Component<IInputProps, InputState> {
        static TextArea: typeof TextArea;
        static defaultProps: {
            type: string;
        };
        input: HTMLInputElement | HTMLTextAreaElement | null;
        constructor(props: IInputProps);
        static getDerivedStateFromProps(nextProps: IInputProps, { prevValue }: InputState): Partial<InputState>;
        saveInput: (input: HTMLInputElement) => void;
        setValue(value: string): void;
        handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
        handleKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
        render(): React.JSX.Element;
    }
}
declare module "src/components/input/index" {
    import { Input } from "src/components/input/input";
    export type { IInputProps } from "src/components/input/input";
    export type { ITextAreaProps } from "src/components/input/textArea";
    export { Input };
}
declare module "src/components/list/item" {
    import React from 'react';
    import type { UniqueId } from "src/common/types";
    export interface IItemProps extends Omit<React.ComponentProps<'li'>, 'id'> {
        id: UniqueId;
        disabled?: boolean;
        disable?: UniqueId;
        active?: UniqueId;
        onClick?(event: React.MouseEvent, item?: IItemProps): void;
    }
    export function Item(props: React.PropsWithChildren<IItemProps>): React.JSX.Element;
}
declare module "src/components/list/list" {
    import React from 'react';
    import { ComponentProps } from 'react';
    import type { UniqueId } from "src/common/types";
    import { IItemProps } from "src/components/list/item";
    export interface IListProps extends Omit<ComponentProps<'ul'>, 'onSelect'> {
        /**
         * Default is vertical mode
         */
        mode?: 'horizontal' | 'vertical';
        /**
         * Current active
         */
        current?: string;
        /**
         * It's used to disable specific item, the value of disable is id string
         */
        disable?: UniqueId;
        /**
         * Listen to the select event of List
         * @param event React mouse event
         * @param item Selected the List item object
         */
        onSelect?(event: React.MouseEvent, item?: IItemProps): void;
        /**
         * Listen to the click event of List
         * @param event React mouse event
         * @param item Clicked the List item object
         */
        onClick?(event: React.MouseEvent, item?: IItemProps): void;
    }
    export const defaultListClassName: string;
    export const verticalClassName: string;
    export const horizontalClassName: string;
    export function List(props: React.PropsWithChildren<IListProps>): React.JSX.Element;
}
declare module "src/components/list/index" {
    export * from "src/components/list/list";
    export * from "src/components/list/item";
}
declare module "src/monaco/monacoService" {
    import 'reflect-metadata';
    import { editor as MonacoEditor } from 'monaco-editor';
    import { IStandaloneEditorConstructionOptions } from 'monaco-editor/esm/vs/editor/standalone/browser/standaloneCodeEditor';
    import { IEditorOverrideServices } from 'monaco-editor/esm/vs/editor/standalone/browser/standaloneServices';
    import { ICommandService } from 'monaco-editor/esm/vs/platform/commands/common/commands';
    import { ServiceCollection } from 'monaco-editor/esm/vs/platform/instantiation/common/serviceCollection';
    export interface IMonacoService {
        readonly services: ServiceCollection;
        readonly commandService: ICommandService;
        readonly container: HTMLElement | null;
        create(domElement: HTMLElement, options?: IStandaloneEditorConstructionOptions, overrides?: IEditorOverrideServices): MonacoEditor.IStandaloneCodeEditor;
        /**
         * Initial the Workspace, like Services and editor config.
         */
        initWorkspace(container: HTMLElement): void;
    }
    export class MonacoService implements IMonacoService {
        private _services;
        private simpleEditorModelResolverService;
        private _container;
        constructor();
        initWorkspace(container: HTMLElement): void;
        get container(): HTMLElement;
        get services(): ServiceCollection;
        get commandService(): any;
        private mergeEditorServices;
        create(domElement: HTMLElement, options?: IStandaloneEditorConstructionOptions, overrides?: IEditorOverrideServices): MonacoEditor.IStandaloneCodeEditor;
        private createStandaloneServices;
    }
}
declare module "src/components/monaco/index" {
    import 'reflect-metadata';
    import React from 'react';
    import { PureComponent } from 'react';
    import { editor } from 'monaco-editor';
    export const SYMBOL_MONACO_EDITOR: string;
    export interface IMonacoEditorProps extends React.ComponentProps<any> {
        /**
         * The option of monaco editor
         */
        options?: editor.IStandaloneEditorConstructionOptions;
        /**
         * The override for monaco editor
         */
        override?: editor.IEditorOverrideServices;
        editorInstanceRef?: (instance: editor.IStandaloneCodeEditor) => void;
        onChangeEditorProps?: (props: IMonacoEditorProps, nextProps: IMonacoEditorProps) => void;
    }
    export class MonacoEditor extends PureComponent<IMonacoEditorProps> {
        /**
         * The instance of monaco
         */
        private monacoInstance;
        /**
         * The dom element of editor container
         */
        private monacoDom;
        private readonly monacoService;
        constructor(props: any);
        componentDidMount(): void;
        componentDidUpdate(prevProps: any): void;
        render(): React.JSX.Element;
    }
}
declare module "src/components/scrollBar/base" {
    export const baseClassName: string;
    export const scrollBarClassName: string;
    export const scrollBarContainerClassName: string;
    export const scrollBarShadowClassName: string;
    export const scrollBarTrackClassName: string;
    export const scrollBarThumbClassName: string;
    export const scrollBarContainerHorizontalClassName: string;
    export const scrollBarContainerVerticalClassName: string;
    export const scrollBarTrackHiddenClassName: string;
    export const scrollBarTrackVerticalClassName: string;
    export const scrollBarTrackHorizontalClassName: string;
    export const scrollBarShadowHiddenClassName: string;
}
declare module "src/components/scrollBar/index" {
    import React, { CSSProperties } from 'react';
    export enum DirectionKind {
        vertical = "vertical",
        horizontal = "horizontal"
    }
    export interface IScrollbarProps {
        inactiveHidden?: boolean;
        style?: CSSProperties;
        trackStyle?: CSSProperties;
        className?: string;
        direction?: DirectionKind;
        isShowShadow?: boolean;
        onScroll?: (evt: IScrollEvent, e: MouseEvent | React.MouseEvent) => void;
        onScrollStart?: (evt: IScrollEvent, e: MouseEvent | React.MouseEvent) => void;
        onScrollEnd?: (evt: IScrollEvent, e: MouseEvent | React.MouseEvent) => void;
    }
    export interface IScrollEvent {
        scrollTop: number;
    }
    export interface IScrollRef {
        scrollHeight: number;
        scrollTo: (offset: number) => void;
    }
    export const ScrollBar: React.ForwardRefExoticComponent<IScrollbarProps & {
        children?: React.ReactNode;
    } & React.RefAttributes<IScrollRef>>;
}
declare module "src/components/search/base" {
    export const defaultSearchClassName: string;
    export const baseInputClassName: string;
    export const inputGroupClassName: string;
    export const searchToolBarClassName: string;
    export const replaceContainerClassName: string;
    export const searchTargetContainerClassName: string;
    export const replaceBtnClassName: string;
    export const validationBaseInputClassName: string;
    export const validationInfoInputClassName: string;
    export const validationWarningInputClassName: string;
    export const validationErrorInputClassName: string;
}
declare module "src/components/search/input" {
    import React from 'react';
    import { IActionBarItemProps } from "src/components/actionBar/index";
    export enum InfoTypeEnums {
        info = "info",
        warning = "warning",
        error = "error"
    }
    export type InfoTypeEnum = keyof typeof InfoTypeEnums;
    export interface IBaseInputProps {
        value?: string;
        className?: string;
        placeholder?: string;
        toolbarData?: IActionBarItemProps[];
        info?: {
            type: InfoTypeEnum;
            text: string;
        };
        onChange?: (value: string) => void;
        onToolbarClick?: (addon: any) => void;
    }
    /**
     * Mock an Input by textarea
     * 'Cause we have to achieve text wrap and input cannot achieve it
     */
    function Input(props: IBaseInputProps): React.JSX.Element;
    namespace Input {
        var Group: ({ children }: {
            children: any;
        }) => React.JSX.Element;
    }
    export default Input;
}
declare module "src/components/search/index" {
    import React from 'react';
    import { IActionBarItemProps } from "src/components/actionBar/index";
    import { InfoTypeEnum } from "src/components/search/input";
    export type SearchValues = (string | undefined)[];
    export interface ISearchProps extends React.ComponentProps<any> {
        style?: React.CSSProperties;
        className?: string;
        values?: SearchValues;
        placeholders?: string[];
        addons?: (IActionBarItemProps[] | undefined)[];
        validationInfo?: string | {
            type: InfoTypeEnum;
            text: string;
        };
        onAddonClick?: (addon: any) => void;
        onButtonClick?: (status: boolean) => void;
        /**
         * onChange only oberseves the values of inputs
         *
         * first value is from query input
         *
         * second value is from replace input
         */
        onChange?: (value?: SearchValues) => void;
        /**
         * onSearch always be triggered behind onChange or onClick
         */
        onSearch?: (value?: SearchValues) => void;
    }
    export function Search(props: ISearchProps): React.JSX.Element;
}
declare module "src/components/select/option" {
    import React from 'react';
    import { ComponentProps } from 'react';
    export interface ISelectOptionProps extends ComponentProps<'div'> {
        value?: string;
        name?: string;
        description?: string;
        disabled?: boolean;
    }
    export function Option(props: ISelectOptionProps): React.JSX.Element;
}
declare module "src/components/select/select" {
    import React from 'react';
    import { PureComponent, ComponentProps } from 'react';
    import { ISelectOptionProps } from "src/components/select/option";
    export interface ISelectProps extends Omit<ComponentProps<'div'>, 'onSelect'> {
        value?: string;
        style?: React.CSSProperties;
        className?: string;
        defaultValue?: string;
        placeholder?: string;
        children?: React.ReactNode;
        onSelect?(e: React.MouseEvent, selectedOption?: ISelectOptionProps): void;
    }
    type IState = {
        isOpen: boolean;
        option: ISelectOptionProps;
    };
    export const selectClassName: string;
    export const inputClassName: string;
    export class Select extends PureComponent<ISelectProps, IState> {
        private contextView;
        state: IState;
        private selectElm;
        private selectInput;
        constructor(props: any);
        static getDerivedStateFromProps(props: any, state: any): {
            option: ISelectOptionProps;
        };
        componentDidMount(): void;
        componentWillUnmount(): void;
        private static getSelectOption;
        private getDefaultState;
        handleOnClickOption: (e: React.MouseEvent) => void;
        handleOnHoverOption: (e: React.MouseEvent) => void;
        handleOnClickSelect: (e: React.MouseEvent) => void;
        render(): React.JSX.Element;
    }
}
declare module "src/components/select/index" {
    export * from "src/components/select/select";
    export * from "src/components/select/option";
}
declare module "src/model/workbench/activityBar" {
    import React from 'react';
    import { IMenuItemProps } from "src/components/index";
    import type { HTMLElementProps, UniqueId } from "src/common/types";
    /**
     * The activity bar event definition
     */
    export enum ActivityBarEvent {
        OnClick = "activityBar.onClick",
        OnChange = "activityBar.onChange",
        /**
         * Activity bar data changed
         */
        DataChanged = "activityBar.data",
        ReRender = "activityBar.reRender"
    }
    export interface IActivityBarItem extends HTMLElementProps {
        id: UniqueId;
        name?: React.ReactNode;
        hidden?: boolean;
        data?: any;
        icon?: string | JSX.Element;
        checked?: boolean;
        disabled?: boolean;
        type?: 'normal' | 'global';
        contextMenu?: IActivityMenuItemProps[];
        sortIndex?: number;
        render?: () => React.ReactNode | JSX.Element;
    }
    export interface IActivityMenuItemProps extends IMenuItemProps {
        id: UniqueId;
    }
    export interface IActivityBar {
        data?: IActivityBarItem[];
        contextMenu?: IActivityMenuItemProps[];
        selected?: UniqueId;
    }
    export class ActivityBarModel implements IActivityBar {
        data: IActivityBarItem[];
        contextMenu: IActivityMenuItemProps[];
        selected: UniqueId;
        constructor(data?: IActivityBarItem[], contextMenu?: IActivityMenuItemProps[], selected?: UniqueId);
    }
}
declare module "src/model/workbench/auxiliaryBar" {
    import React from 'react';
    import type { UniqueId } from "src/common/types";
    export enum AuxiliaryEventKind {
        onTabClick = "AuxiliaryBar.onClick"
    }
    export type IAuxiliaryBarMode = 'default' | 'tabs';
    export type IAuxiliaryData = {
        key: UniqueId;
        title: React.ReactNode;
    };
    export interface IAuxiliaryBar {
        mode: IAuxiliaryBarMode;
        data: IAuxiliaryData[];
        current?: UniqueId;
        children?: React.ReactNode;
    }
    export class AuxiliaryModel implements IAuxiliaryBar {
        mode: IAuxiliaryBarMode;
        children: React.ReactNode;
        data: IAuxiliaryData[];
        current?: UniqueId;
        constructor(mode?: IAuxiliaryBarMode, data?: IAuxiliaryData[], current?: UniqueId, children?: React.ReactNode);
    }
}
declare module "src/model/workbench/editor" {
    import { ITabProps } from "src/components/tabs/tab";
    import { ITabsProps } from "src/components/tabs/index";
    import { IMenuItemProps } from "src/components/menu/index";
    import { IBreadcrumbItemProps } from "src/components/breadcrumb/index";
    import { editor as MonacoEditor } from 'monaco-editor';
    import type { UniqueId } from "src/common/types";
    export enum EditorEvent {
        OnCloseTab = "editor.closeTab",
        OnCloseAll = "editor.closeAll",
        OnCloseOther = "editor.closeOther",
        OnCloseToLeft = "editor.closeToLeft",
        OnCloseToRight = "editor.closeToRight",
        OnMoveTab = "editor.moveTab",
        OpenTab = "editor.openTab",
        OnSelectTab = "editor.selectTab",
        OnUpdateTab = "editor.updateTab",
        onActionsClick = "editor.actionsClick",
        OnSplitEditorRight = "editor.splitEditorRight",
        onEditorInstanceMount = "editor.onEditorInstanceMount"
    }
    export interface BuiltInEditorTabDataType {
        language?: string | undefined;
        path?: string;
        value?: string;
        modified?: boolean;
        [key: string]: any;
    }
    export type IEditorOptions = MonacoEditor.IEditorOptions & MonacoEditor.IGlobalEditorOptions;
    export interface IEditorActionsProps extends IMenuItemProps {
        id: UniqueId;
        /**
         * Mark the action placed in More menus or outer
         */
        place?: 'outer' | 'inner';
    }
    export interface IEditorTab<T = BuiltInEditorTabDataType> extends ITabProps<T> {
        breadcrumb?: IBreadcrumbItemProps[];
    }
    export interface IEditorAction {
        actions?: IEditorActionsProps[];
        menu?: IMenuItemProps[];
    }
    export interface IEditorGroup<E = any, T = any> extends ITabsProps {
        id: UniqueId;
        /**
         * Current editor group tab
         */
        tab?: IEditorTab<T>;
        actions?: IEditorActionsProps[];
        menu?: IMenuItemProps[];
        editorInstance?: E;
    }
    export interface IEditor {
        /**
         * Current editor group
         */
        current?: IEditorGroup | null;
        /**
         * Editor Groups
         */
        groups?: IEditorGroup[];
        /**
         * The welcome page of editor bench
         */
        entry?: React.ReactNode;
        /**
         * Built-in editor options, there is main apply it to monaco-editor
         */
        editorOptions?: IEditorOptions;
    }
    export class EditorGroupModel<E = any, T = any> implements IEditorGroup<E, T> {
        id: UniqueId;
        tab: IEditorTab<T>;
        data: IEditorTab<T>[];
        actions: IEditorActionsProps[];
        menu: IMenuItemProps[];
        editorInstance: E | undefined;
        activeTab: UniqueId | undefined;
        constructor(id: UniqueId, tab: IEditorTab<T>, activeTab: UniqueId | undefined, data: IEditorTab<T>[], actions?: IEditorActionsProps[], menu?: IMenuItemProps[], editorInstance?: E);
    }
    export class EditorModel implements IEditor {
        current: IEditorGroup | null;
        groups: IEditorGroup[];
        entry: React.ReactNode;
        editorOptions: IEditorOptions;
        constructor(current: IEditorGroup | null, groups: IEditorGroup[], entry: React.ReactNode, editorOptions?: IEditorOptions);
    }
}
declare module "src/model/workbench/sidebar" {
    import type { UniqueId } from "src/common/types";
    export interface ISidebarPane {
        id: UniqueId;
        title?: string;
        render?: () => React.ReactNode;
    }
    export interface ISidebar {
        current: UniqueId;
        panes: ISidebarPane[];
    }
    export class SidebarModel implements ISidebar {
        current: UniqueId;
        panes: ISidebarPane[];
        constructor(panes?: ISidebarPane[], selected?: UniqueId);
    }
}
declare module "src/model/workbench/statusBar" {
    import React from 'react';
    import { IMenuItemProps } from "src/components/menu/index";
    import type { HTMLElementProps, UniqueId } from "src/common/types";
    export enum Float {
        left = "left",
        right = "right"
    }
    export interface IStatusBarItem<T = any> extends HTMLElementProps {
        id: UniqueId;
        sortIndex?: number;
        data?: T;
        onClick?(e: React.MouseEvent, item?: IStatusBarItem): any;
        render?: (item: IStatusBarItem) => React.ReactNode;
        name?: string;
    }
    export interface IStatusBar {
        rightItems: IStatusBarItem[];
        leftItems: IStatusBarItem[];
        contextMenu?: IMenuItemProps[];
    }
    /**
     * The activity bar event definition
     */
    export enum StatusBarEvent {
        /**
         * Selected an activity bar
         */
        onClick = "statusBar.onClick",
        /**
         * Activity bar data changed
         */
        DataChanged = "statusBar.data"
    }
    export class StatusBarModel implements IStatusBar {
        leftItems: IStatusBarItem[];
        rightItems: IStatusBarItem[];
        contextMenu: IMenuItemProps[];
        constructor(leftItems?: IStatusBarItem[], rightItems?: IStatusBarItem[], contextMenu?: IMenuItemProps[]);
    }
}
declare module "src/model/workbench/layout" {
    export enum Position {
        left = "left",
        right = "right"
    }
    export enum MenuBarMode {
        horizontal = "horizontal",
        vertical = "vertical"
    }
    export enum LayoutEvents {
        OnWorkbenchDidMount = "workbench.didMount"
    }
    export interface ViewVisibility {
        hidden: boolean;
    }
    export interface IPanelViewState extends ViewVisibility {
        panelMaximized: boolean;
    }
    export interface ISidebarViewState extends ViewVisibility {
        position: keyof typeof Position;
    }
    export interface IMenuBarViewState extends ViewVisibility {
        mode: keyof typeof MenuBarMode;
    }
    export interface ILayout {
        splitPanePos: (number | string)[];
        horizontalSplitPanePos: (number | string)[];
        activityBar: ViewVisibility;
        auxiliaryBar: ViewVisibility;
        panel: IPanelViewState;
        statusBar: ViewVisibility;
        sidebar: ISidebarViewState;
        menuBar: IMenuBarViewState;
        groupSplitPos: (number | string)[];
        editorGroupDirection: MenuBarMode;
    }
    export class LayoutModel implements ILayout {
        splitPanePos: (number | string)[];
        horizontalSplitPanePos: (number | string)[];
        groupSplitPos: (number | string)[];
        activityBar: ViewVisibility;
        auxiliaryBar: ViewVisibility;
        panel: IPanelViewState;
        statusBar: ViewVisibility;
        sidebar: ISidebarViewState;
        menuBar: IMenuBarViewState;
        editorGroupDirection: MenuBarMode;
        constructor(splitPanePos?: (number | string)[], horizontalSplitPanePos?: string[], groupSplitPos?: any[], activityBar?: {
            hidden: boolean;
        }, auxiliaryBar?: {
            hidden: boolean;
        }, panel?: {
            hidden: boolean;
            panelMaximized: boolean;
        }, statusBar?: {
            hidden: boolean;
        }, sidebar?: {
            hidden: boolean;
            position: Position;
        }, menuBar?: {
            hidden: boolean;
            mode: MenuBarMode;
        }, editorGroupDirection?: MenuBarMode);
    }
}
declare module "src/model/workbench/menuBar" {
    import React from 'react';
    import { ISubMenuProps } from "src/components/menu/subMenu";
    import { IMenuItemProps } from "src/components/menu/index";
    import type { UniqueId } from "src/common/types";
    import { MenuBarMode } from "src/model/workbench/layout";
    /**
     * The activity bar event definition
     */
    export enum MenuBarEvent {
        /**
         * Selected an activity bar
         */
        onSelect = "menuBar.onSelect",
        onChangeMode = "menuBar.onChangeMode"
    }
    export interface IMenuBarItem {
        id?: UniqueId;
        name?: string;
        icon?: string | JSX.Element;
        data?: ISubMenuProps[];
        render?: (data: IMenuItemProps) => React.ReactNode | JSX.Element;
        disabled?: boolean;
    }
    export interface IMenuBar {
        data: IMenuBarItem[];
        mode?: keyof typeof MenuBarMode;
        logo?: React.ReactNode;
    }
    export class MenuBarModel implements IMenuBar {
        data: IMenuBarItem[];
        constructor(data?: IMenuBarItem[]);
    }
}
declare module "src/model/workbench/explorer/explorer" {
    import React from 'react';
    import { IActionBarItemProps } from "src/components/actionBar/index";
    import type { UniqueId } from "src/common/types";
    export enum ExplorerEvent {
        onClick = "explorer.onClick",
        onPanelToolbarClick = "explorer.onPanelToolbarClick",
        onCollapseChange = "explorer.onCollapseChange",
        onRemovePanel = "explorer.onRemovePanel",
        onCollapseAllFolders = "explorer.onCollapseAllFolders"
    }
    export type RenderFunctionProps = (props: any) => React.ReactNode;
    export interface IExplorerPanelItem {
        /**
         * It must be unique in the Explorer Panel Data
         */
        id: UniqueId;
        /**
         * @requires true
         * explorer panel's title
         */
        name: string;
        /**
         * specify panel order
         * the bigger the number is ranked previous
         */
        sortIndex?: number;
        className?: string;
        toolbar?: IActionBarItemProps[];
        renderPanel?: RenderFunctionProps;
        /**
         * whether hidden in explorer
         */
        hidden?: boolean;
        [key: string]: any;
    }
    export interface IExplorer {
        data: IExplorerPanelItem[];
        headerToolBar?: IActionBarItemProps;
        activePanelKeys?: UniqueId[];
    }
    export class IExplorerModel implements IExplorer {
        data: IExplorerPanelItem[];
        headerToolBar?: IActionBarItemProps;
        activePanelKeys?: UniqueId[];
        constructor(data?: IExplorerPanelItem[], headerToolBar?: IActionBarItemProps, activePanelKeys?: UniqueId[]);
    }
}
declare module "src/components/tree/base" {
    export const defaultTreeClassName: string;
    export const defaultTreeNodeClassName: string;
    export const activeTreeNodeClassName: string;
    export const expandTreeNodeClassName: string;
    export const unexpandTreeNodeClassName: string;
    export const indentClassName: string;
    export const indentGuideClassName: string;
    export const treeNodeTitleClassName: string;
}
declare module "src/components/tree/treeNode" {
    import React from 'react';
    import { ITreeNodeItemProps } from "src/components/tree/index";
    interface ITreeNodeProps {
        data: ITreeNodeItemProps;
        indent: number;
        name?: string;
        className?: string;
        draggable?: boolean;
        renderIcon: () => JSX.Element | null;
        renderTitle: () => React.ReactNode;
        onContextMenu?: React.MouseEventHandler<HTMLDivElement>;
        onClick?: React.MouseEventHandler<HTMLDivElement>;
        onNodeDragStart?: (e: React.DragEvent<HTMLDivElement>, node: ITreeNodeItemProps) => void;
        onNodeDragEnter?: (e: React.DragEvent<HTMLDivElement>, node: ITreeNodeItemProps) => void;
        onNodeDragOver?: (e: React.DragEvent<HTMLDivElement>, node: ITreeNodeItemProps) => void;
        onNodeDragEnd?: (e: React.DragEvent<HTMLDivElement>, node: ITreeNodeItemProps) => void;
        onNodeDrop?: (e: React.DragEvent<HTMLDivElement>, node: ITreeNodeItemProps) => void;
    }
    const _default_1: ({ data, indent, className, name, renderIcon, renderTitle, draggable, onContextMenu, onClick, onNodeDragStart, onNodeDragEnter, onNodeDragOver, onNodeDrop, onNodeDragEnd, }: ITreeNodeProps) => React.JSX.Element;
    export default _default_1;
}
declare module "src/common/treeUtil" {
    import type { UniqueId } from "src/common/types";
    interface IWithIdProps {
        id: UniqueId;
        children?: any[];
    }
    interface ITreeInterface<T> {
        /**
         * The count of tree node
         */
        count: number;
        /**
         * The Raw tree data
         */
        obj: T;
        /**
         * Returns the tree informations about the node found by id,
         * Contains
         * - the parent's id
         * - the previous node's id
         * - the next node's id
         * - and the collection of children's id
         * @param id
         */
        getHashMap(id: UniqueId): IMapNode<T> | null;
        /**
         * Returns the node found in tree by id
         * @param id
         */
        getNode(id: UniqueId): T | null;
        /**
         * Remove the node found in tree by id
         * @param id
         */
        removeNode(id: UniqueId): T | null;
        /**
         * Update the node found in tree by id
         * @param id
         * @param extra
         */
        updateNode(id: UniqueId, extra: T): T | null;
        /**
         * Insert an object whose parent node is found by parentId and position is i into the tree
         * @param obj
         * @param parentId
         * @param i
         */
        insertNode(obj: T, parentId: UniqueId, i: number): IMapNode<T> | null;
        /**
         * Insert an object before the destiny node whose id is `destId`
         * @param obj
         * @param destId
         */
        insertBefore(obj: T, destId: UniqueId): IMapNode<T> | null;
        /**
         * Insert an object after the destiny node whose id is `destId`
         * @param obj
         * @param destId
         */
        insertAfter(obj: T, destId: UniqueId): IMapNode<T> | null;
        /**
         * Prepend an object into tree
         * @param obj
         * @param destId
         */
        prepend(obj: T, destId: UniqueId): IMapNode<T> | null;
        /**
         * Append an object into tree
         * @param obj
         * @param destId
         */
        append(obj: T, destId: UniqueId): IMapNode<T> | null;
    }
    interface IMapNode<T> {
        id: string;
        node: T;
        parent?: string;
        children?: string[];
        prev?: string;
        next?: string;
    }
    /**
     * A tool for flating tree node.
     *
     * It's convenient to get the relationship between tree nodes.
     *
     * How to get the parent node by current node id
     * @example
     * ```ts
     * const tree = new TreeViewUtil(treeData); // Initialize the tree utils
     * const currentHash = tree.getHashMap(currentNodeId); // Get the current hashmap by current node's id
     * const parentNodeId = currentHash.parent; // This is the parent node's id
     * const parentNode = tree.getNode(parentNodeId); // This is the parent node
     * ```
     *
     * @aware There should be aware of that the id of tree node must be global unique
     */
    export class TreeViewUtil<T extends IWithIdProps = any> implements ITreeInterface<T> {
        protected hashMap: Map<string, IMapNode<T>>;
        count: number;
        obj: T;
        constructor(obj: T);
        private addMap;
        private generateChildren;
        private generate;
        getHashMap: (id: UniqueId) => IMapNode<T>;
        private removeHashMap;
        getNode: (id: UniqueId) => T;
        removeNode: (id: UniqueId) => T;
        updateNode: (id: UniqueId, extra: Omit<T, 'id' | 'children'>) => T;
        private updateChildren;
        insertNode: (obj: T, parentId: UniqueId, i: number) => IMapNode<T>;
        insertBefore: (obj: T, destId: UniqueId) => IMapNode<T>;
        insertAfter: (obj: T, destId: UniqueId) => IMapNode<T>;
        prepend: (obj: T, destId: UniqueId) => IMapNode<T>;
        append: (obj: T, destId: UniqueId) => IMapNode<T>;
    }
}
declare module "src/components/tree/index" {
    import React from 'react';
    import type { UniqueId } from "src/common/types";
    export interface ITreeNodeItemProps<T = any> {
        /**
         * The unique id in tree node
         * @aware Please be aware of that id should be global unique
         */
        id: UniqueId;
        /**
         * The name of this tree node
         */
        name?: string;
        /**
         * The icon of this tree node, which is rendered in front of the name
         */
        icon?: string | JSX.Element;
        /**
         * The status of disabled
         */
        disabled?: boolean;
        /**
         * The type of this tree node.
         */
        isLeaf?: boolean;
        /**
         * The status of editable, mark whether the node is being edited
         */
        isEditable?: boolean;
        /**
         * The children of this tree node
         */
        children?: ITreeNodeItemProps[];
        /**
         * Store the custom data
         */
        data?: T;
        [key: string]: any;
    }
    export interface ITreeProps {
        data?: ITreeNodeItemProps[];
        className?: string;
        draggable?: boolean;
        expandKeys?: UniqueId[];
        loadedKeys?: string[];
        activeKey?: UniqueId;
        onExpand?: (expandedKeys: UniqueId[], node: ITreeNodeItemProps) => void;
        onSelect?: (node: ITreeNodeItemProps, isUpdate?: any) => void;
        onTreeClick?: () => void;
        renderTitle?: (node: ITreeNodeItemProps, index: number, isLeaf: boolean) => JSX.Element | string;
        onDropTree?(source: ITreeNodeItemProps, target: ITreeNodeItemProps): void;
        onLoadData?: (node: ITreeNodeItemProps) => Promise<void>;
        onRightClick?: (e: React.MouseEvent<HTMLDivElement, MouseEvent>, node: ITreeNodeItemProps) => void;
    }
    const TreeView: ({ className, data, draggable, loadedKeys, expandKeys: controlExpandKeys, activeKey: controlActiveKey, onExpand, onDropTree, onRightClick, renderTitle, onSelect, onLoadData, onTreeClick, }: ITreeProps) => React.JSX.Element;
    export default TreeView;
}
declare module "src/model/workbench/explorer/folderTree" {
    import React from 'react';
    import 'reflect-metadata';
    import type { ITreeNodeItemProps } from "src/components/tree/index";
    import type { IMenuItemProps } from "src/components/menu/index";
    import type { UniqueId } from "src/common/types";
    export enum FileTypes {
        File = "File",
        Folder = "Folder",
        RootFolder = "RootFolder"
    }
    export type FileType = keyof typeof FileTypes;
    export enum FolderTreeEvent {
        onSelectFile = "folderTree.onSelectFile",
        onDelete = "folderTree.onDelete",
        onRename = "folderTree.onRename",
        onUpdateFileName = "folderTree.onUpdateFileName",
        onRightClick = "folderTree.onRightClick",
        onContextMenuClick = "folderTree.onContextMenuClick",
        onCreate = "folderTree.onCreate",
        onLoadData = "folderTree.onLoadData",
        onDrop = "folderTree.onDrop",
        onExpandKeys = "folderTree.onExpandKeys"
    }
    export interface IFolderInputEvent {
        onFocus: () => void;
        setValue: (value: string) => void;
    }
    export interface IFolderTreeSubItem {
        data?: IFolderTreeNodeProps[];
        contextMenu?: IMenuItemProps[];
        folderPanelContextMenu?: IMenuItemProps[];
        current?: IFolderTreeNodeProps | null;
        expandKeys?: UniqueId[];
        loadedKeys?: string[];
    }
    export interface IFolderTree {
        folderTree?: IFolderTreeSubItem;
        entry?: React.ReactNode;
        autoSort?: Boolean;
    }
    export interface IFolderTreeNodeProps extends ITreeNodeItemProps<any> {
        location?: string;
        content?: string;
        fileType?: FileType;
        children?: IFolderTreeNodeProps[];
    }
    export class TreeNodeModel implements IFolderTreeNodeProps {
        id: UniqueId;
        name?: string;
        location?: string;
        isLeaf?: boolean;
        fileType: FileType;
        children?: IFolderTreeNodeProps[];
        icon?: string | JSX.Element;
        isEditable?: boolean;
        content?: string;
        data?: any;
        constructor(props: IFolderTreeNodeProps);
    }
    export class IFolderTreeModel implements IFolderTree {
        folderTree: IFolderTreeSubItem;
        entry: React.ReactNode;
        autoSort: Boolean;
        constructor(folderTree?: IFolderTreeSubItem, autoSort?: Boolean, entry?: React.ReactNode);
    }
}
declare module "src/model/workbench/explorer/editorTree" {
    export enum EditorTreeEvent {
        onClose = "editorTree.close",
        onSelect = "editorTree.select",
        onCloseOthers = "editorTree.closeOthers",
        onCloseSaved = "editorTree.closeSaved",
        onCloseAll = "editorTree.closeAll",
        onSaveAll = "editorTree.saveAll",
        onSplitEditorLayout = "editorTree.splitEditorLayout",
        onToolbarClick = "editorTree.toolbarClick",
        onContextMenu = "editorTree.contextMenuClick"
    }
    export class EditorTree {
        constructor();
    }
}
declare module "src/model/workbench/search" {
    import { ITreeNodeItemProps } from "src/components/index";
    import { IActionBarItemProps } from "src/components/actionBar/index";
    import { InfoTypeEnum } from "src/components/search/input";
    export enum SearchEvent {
        onChange = "search.onChange",
        onSearch = "search.onSearch",
        onReplaceAll = "search.onReplaceAll",
        onResultClick = "search.onResultClick"
    }
    export interface ISearchProps {
        headerToolBar?: IActionBarItemProps[];
        searchAddons?: IActionBarItemProps[];
        replaceAddons?: IActionBarItemProps[];
        result: ITreeNodeItemProps[];
        value?: string;
        replaceValue?: string;
        replaceMode?: boolean;
        validationInfo?: {
            type: InfoTypeEnum;
            text: string;
        };
        isRegex?: boolean;
        isCaseSensitive?: boolean;
        isWholeWords?: boolean;
        preserveCase?: boolean;
    }
    export class SearchModel implements ISearchProps {
        headerToolBar: IActionBarItemProps[];
        searchAddons: IActionBarItemProps[];
        replaceAddons: IActionBarItemProps[];
        result: ITreeNodeItemProps[];
        value: string;
        replaceValue: string;
        replaceMode: boolean;
        isRegex: boolean;
        isCaseSensitive: boolean;
        isWholeWords: boolean;
        preserveCase: boolean;
        validationInfo: {
            type: InfoTypeEnum;
            text: string;
        };
        constructor(headerToolBar?: IActionBarItemProps[], searchAddons?: IActionBarItemProps[], replaceAddons?: IActionBarItemProps[], result?: any[], value?: string, replaceValue?: string, replaceMode?: boolean, isCaseSensitive?: boolean, isWholeWords?: boolean, isRegex?: boolean, preserveCase?: boolean, validationInfo?: {
            type: InfoTypeEnum;
            text: string;
        });
    }
}
declare module "src/monaco/index" {
    /**
     * This module is overwrite the original monaco-editor/esm/vs/editor/editor.main.js
     */
    import 'monaco-editor/esm/vs/language/typescript/monaco.contribution';
    import 'monaco-editor/esm/vs/language/css/monaco.contribution';
    import 'monaco-editor/esm/vs/language/json/monaco.contribution';
    import 'monaco-editor/esm/vs/language/html/monaco.contribution';
    import 'monaco-editor/esm/vs/basic-languages/monaco.contribution';
    import 'monaco-editor/esm/vs/editor/editor.all';
    import 'monaco-editor/esm/vs/editor/standalone/browser/accessibilityHelp/accessibilityHelp';
    import 'monaco-editor/esm/vs/editor/standalone/browser/iPadShowKeyboard/iPadShowKeyboard';
    import 'monaco-editor/esm/vs/editor/standalone/browser/inspectTokens/inspectTokens';
    import 'monaco-editor/esm/vs/editor/standalone/browser/quickAccess/standaloneHelpQuickAccess';
    import 'monaco-editor/esm/vs/editor/standalone/browser/quickAccess/standaloneGotoLineQuickAccess';
    import 'monaco-editor/esm/vs/editor/standalone/browser/quickAccess/standaloneGotoSymbolQuickAccess';
    import 'monaco-editor/esm/vs/editor/standalone/browser/quickAccess/standaloneCommandsQuickAccess';
    import 'monaco-editor/esm/vs/editor/standalone/browser/referenceSearch/standaloneReferenceSearch';
    import 'monaco-editor/esm/vs/editor/standalone/browser/toggleHighContrast/toggleHighContrast';
    export * from 'monaco-editor/esm/vs/editor/editor.api.js';
}
declare module "src/model/workbench/panel" {
    import { editor as MonacoEditor } from "src/monaco/index";
    import { IActionBarItemProps } from "src/components/actionBar/index";
    import { ITabProps } from "src/components/tabs/tab";
    export interface IPanelItem<T = any> extends ITabProps<T> {
        /**
         * The same as HTMLElement title attribute
         */
        title?: string;
        toolbox?: IActionBarItemProps[];
        data?: T;
        /**
         * The sort of panel item
         */
        sortIndex?: number;
    }
    export enum PanelEvent {
        onTabChange = "panel.onTabChange",
        onToolbarClick = "panel.onToolbarClick",
        onTabClose = "panel.onTabClose"
    }
    export interface IPanel {
        current?: IPanelItem | null;
        data?: IPanelItem[];
        toolbox?: IActionBarItemProps[];
    }
    export interface IOutput extends IPanelItem {
        outputEditorInstance?: MonacoEditor.IStandaloneCodeEditor;
        onUpdateEditorIns?(editorInstance: MonacoEditor.IStandaloneCodeEditor): void;
    }
    export class PanelModel implements IPanel {
        current: IPanelItem | null;
        data: IPanelItem[];
        hidden: boolean;
        maximize: boolean;
        toolbox: IActionBarItemProps[];
        constructor(current?: IPanelItem | null, data?: IPanelItem[], toolbox?: IActionBarItemProps[]);
    }
}
declare module "src/model/workbench/index" {
    import { IActivityBar, IMenuBar, IPanel, ISidebar, IStatusBar } from "src/model/index";
    export * from "src/model/workbench/activityBar";
    export * from "src/model/workbench/auxiliaryBar";
    export * from "src/model/workbench/editor";
    export * from "src/model/workbench/sidebar";
    export * from "src/model/workbench/statusBar";
    export * from "src/model/workbench/menuBar";
    export * from "src/model/workbench/explorer/explorer";
    export * from "src/model/workbench/explorer/folderTree";
    export * from "src/model/workbench/explorer/editorTree";
    export * from "src/model/workbench/search";
    export * from "src/model/workbench/panel";
    export interface IWorkbench {
        panel: IPanel;
        activityBar: IActivityBar;
        menuBar: IMenuBar;
        statusBar: IStatusBar;
        sidebar: ISidebar;
    }
}
declare module "src/common/error" {
    export const ErrorMsg: {
        LoadExtensionFail: string;
        NotFoundActivateMethod: string;
    };
}
declare module "src/model/colorTheme" {
    export interface IColors {
        [colorId: string]: string;
    }
    export interface TokenColor extends Object {
        name?: string;
        scope?: string | string[];
        settings?: object;
    }
    /**
     * Color scheme used by the OS and by color themes.
     */
    export enum ColorScheme {
        DARK = "dark",
        LIGHT = "light",
        HIGH_CONTRAST = "hc"
    }
    export enum ColorThemeMode {
        dark = "dark",
        light = "light"
    }
    export enum ColorThemeEvent {
        onChange = "colorTheme.onChange"
    }
    export interface IColorTheme {
        /**
         * The id of component, theme will be applied by this ID
         */
        id: string;
        label: string;
        name?: string;
        uiTheme?: string;
        path?: string;
        description?: string;
        type?: ColorScheme;
        colors?: IColors;
        tokenColors?: TokenColor[];
        /**
         * The semanticTokenColors mappings as well as
         * the semanticHighlighting setting
         * allow to enhance the highlighting in the editor
         * More info visit: https://code.visualstudio.com/api/language-extensions/semantic-highlight-guide
         */
        semanticHighlighting?: boolean;
    }
}
declare module "src/extensions/locales-defaults/index" {
    import { IExtension } from "src/model/extension";
    export const ExtendsLocales: IExtension;
    export const BuiltInLocales: any[];
    export const BuiltInId: any;
    export const BuiltInDefault: any;
}
declare module "src/i18n/localization" {
    export { BuiltInLocales, BuiltInDefault } from "src/extensions/locales-defaults/index";
    /**
     * The Localization configuration event definition
     */
    export enum LocalizationEvent {
        /**
         * The Localization changed
         */
        OnChange = "localization.onchange"
    }
    export type LocaleSourceIdType = {
        'menu.file': string;
        'menu.settings': string;
        'menu.colorTheme': string;
        'menu.newFile': string;
        'menu.newFolder': string;
        'menu.open': string;
        'menu.edit': string;
        'menu.undo': string;
        'menu.redo': string;
        'menu.selection': string;
        'menu.selectAll': string;
        'menu.copyLineUp': string;
        'menu.view': string;
        'menu.commandPalette': string;
        'menu.openView': string;
        'menu.appearance': string;
        'menu.showMenuBar': string;
        'menu.showSideBar': string;
        'menu.showSideBar.label': string;
        'menu.showStatusBar': string;
        'menu.showActivityBar': string;
        'menu.showPanel': string;
        'menu.showPanel.title': string;
        'menu.run': string;
        'menu.help': string;
        'menu.menuBarHorizontal': string;
        'menu.menuBarVertical': string;
        'sidebar.explore.title': string;
        'sidebar.explore.folders': string;
        'sidebar.explore.openEditor': string;
        'sidebar.explore.openEditor.group': string;
        'sidebar.explore.outline': string;
        'sidebar.search.title': string;
        'sidebar.replace.placement': string;
        'sidebar.explore.refresh': string;
        'sidebar.explore.collapseFolders': string;
        'sidebar.explore.toggleVertical': string;
        'sidebar.explore.saveAll': string;
        'sidebar.explore.actionDesc': string;
        'sidebar.explore.outlineMore': string;
        'toolbar.refresh': string;
        'toolbar.clearAll': string;
        'toolbar.collapseAll': string;
        'search.matchCase': string;
        'search.matchWholeWord': string;
        'search.useRegularExpression': string;
        'search.preserveCase': string;
        'search.replaceAll': string;
        'panel.output.title': string;
        'panel.toolbox.closePanel': string;
        'panel.toolbox.maximize': string;
        'panel.toolbox.restoreSize': string;
        'panel.problems.title': string;
        'panel.problems.empty': string;
        'notification.title': string;
        'notification.title.no': string;
        'editor.closeToRight': string;
        'editor.closeToLeft': string;
        'editor.closeAll': string;
        'editor.closeSaved': string;
        'editor.closeOthers': string;
        'editor.close': string;
        'editor.actions.splitRight': string;
        'editor.showOpenEditors': string;
        'contextmenu.rename': string;
        'contextmenu.delete': string;
        'contextmenu.newFile': string;
        'contextmenu.newFolder': string;
        'contextmenu.removeFolder': string;
        'contextmenu.openToTheSide': string;
        'contextmenu.addFolderToSpace': string;
        'contextmenu.findInSpace': string;
        'contextmenu.download': string;
    };
    export interface ILocale {
        id: string;
        name: string;
        description?: string;
        /**
         * Whether inherit an exist locale, if it's exist, merge the parent locale
         */
        inherit?: string;
        source: Map<LocaleSourceIdType | string, string>;
    }
}
declare module "src/i18n/localeService" {
    import { ILocale } from "src/i18n/localization";
    import { Component } from "src/react/index";
    export interface ILocaleService {
        /**
         * Initialize the locales data, and the current locale language,
         * @param locales
         * @param localeId
         */
        initialize(locales: ILocale[], localeId: string): void;
        /**
         * Set the current locale language by id
         * @param id
         */
        setCurrentLocale(id: string): boolean;
        /**
         * Get the current locale language
         */
        getCurrentLocale(): ILocale | undefined;
        /**
         * Get All locale languages
         */
        getLocales(): ILocale[];
        /**
         * Get a locale language by the id
         * @param id
         */
        getLocale(id: string): ILocale | undefined;
        /**
         * Add multiple local languages
         * @param locales
         */
        addLocales(locales: ILocale[]): void;
        /**
         * Remove a locale language by the id
         * @param id
         */
        removeLocale(id: string): ILocale | undefined;
        /**
         * Returns the international text located by source key，or the default value if it is not find
         * For examples:
         * ```ts
         * localize('id','default value'); // hello ${i}, ${i}
         * localize('id','default value', 'world'); // hello world, ${i}
         * localize('id','default value', 'world', 'molecule'); // hello world, molecule
         * ```
         * @param sourceKey The key value located in the source international text
         * @param defaultValue The default value to be used when not find the international text
         * @param args If provided, it will used as the values to be replaced in the international text
         * @returns
         */
        localize(sourceKey: string, defaultValue: string, ...args: string[]): string;
        /**
         * Listen to the local language changed event
         * @param callback
         */
        onChange(callback: (prev: ILocale, next: ILocale) => void): void;
        /**
         * Reset the LocaleService to the initial state
         */
        reset(): void;
    }
    export const STORE_KEY: string;
    export const DEFAULT_LOCALE_ID: string;
    export class LocaleService extends Component implements ILocaleService {
        state: {};
        private static LOCALIZE_REPLACED_WORD;
        private _locales;
        private _current;
        constructor();
        reset(): void;
        getLocales(): ILocale[];
        initialize(locales: ILocale[], localeId: string): void;
        getCurrentLocale(): ILocale | undefined;
        getLocale(id: string | null): ILocale | undefined;
        removeLocale(id: string): ILocale | undefined;
        setCurrentLocale(id: string): boolean;
        private transformLocaleData;
        addLocales(locales: ILocale[]): void;
        onChange(callback: (prev: ILocale, next: ILocale) => void): void;
        localize(sourceKey: string, defaultValue?: string, ...args: string[]): string;
    }
}
declare module "src/i18n/localize" {
    import 'reflect-metadata';
    import React from 'react';
    export interface ILocalizeProps {
        sourceKey: string;
        defaultValue?: string;
    }
    /**
     * Returns the international text located by source key，or the default value if it is not find
     * For examples:
     * ```ts
     * localize('id','default value'); // hello ${i}, ${i}
     * localize('id','default value', 'world'); // hello world, ${i}
     * localize('id','default value', 'world', 'molecule'); // hello world, molecule
     * ```
     * @param sourceKey The key value located in the source international text
     * @param defaultValue The default value to be used when not find the international text
     * @param args If provided, it will used as the values to be replaced in the international text
     * @returns
     */
    export function localize(sourceKey: string, defaultValue: string, ...args: string[]): any;
    /**
     * @Deprecated Localize by react component not work correct currently.
     */
    export class Localize extends React.PureComponent<ILocalizeProps> {
        state: {
            localeId: string;
        };
        constructor(props: ILocalizeProps);
        componentDidMount(): void;
        private update;
        private get localeService();
        getValue: () => string;
        render(): string;
    }
}
declare module "src/i18n/index" {
    export { LocaleService } from "src/i18n/localeService";
    export type { ILocaleService } from "src/i18n/localeService";
    export type { ILocale } from "src/i18n/localization";
    export type { ILocalizeProps } from "src/i18n/localize";
    export { localize } from "src/i18n/localize";
}
declare module "src/services/theme/colorRegistry" {
    /**
     * Builtin colors
     */
    import { IColorTheme } from "src/model/colorTheme";
    export function getBuiltInColors(theme: IColorTheme): {
        workbenchBackground: string;
        foreground: string;
        'widget.shadow': string;
        errorForeground: string;
        descriptionForeground: any;
        'icon.foreground': string;
        focusBorder: string;
        'textSeparator.foreground': string;
        'textLink.foreground': string;
        'textLink.activeForeground': string;
        'textBlockQuote.background': string;
        'textBlockQuote.border': string;
        'textCodeBlock.background': string;
        'input.background': string;
        'input.foreground': string;
        'inputOption.activeBorder': string;
        'inputOption.activeBackground': any;
        'input.placeholderForeground': any;
        'dropdown.background': string;
        'dropdown.foreground': string;
        'dropdown.border': string;
        'checkbox.border': string;
        'button.background': string;
        'button.foreground': any;
        'badge.background': string;
        'badge.foreground': any;
        'scrollbar.shadow': string;
        'scrollbarSlider.background': any;
        'scrollbarSlider.hoverBackground': any;
        'scrollbarSlider.activeBackground': any;
        'progressBar.background': any;
        'editorError.background': string;
        'editorWarning.foreground': string;
        'editorInfo.foreground': string;
        'editorHint.foreground': any;
        'editor.background': string;
        'editor.foreground': string;
        'editor.selectionBackground': string;
        'editor.selectionForeground': string;
        'list.dropBackground': string;
        'list.hoverBackground': string;
        'list.activeSelectionBackground': string;
        'list.activeSelectionForeground': any;
        'menu.foreground': string;
        'menu.background': string;
        'menu.separatorBackground': string;
        'panel.background': string;
        'panel.border': string;
        'panelTitle.activeBorder': string;
        'panelTitle.activeForeground': string;
        'activityBar.background': string;
        'activityBar.activeBorder': string;
        'activityBar.foreground': string;
        'statusBar.background': string;
        'statusBar.foreground': string;
    } | {
        workbenchBackground: string;
        foreground: string;
        errorForeground: string;
        descriptionForeground: string;
        'icon.foreground': string;
        focusBorder: string;
        'widget.shadow': string;
        'textSeparator.foreground': string;
        'textLink.foreground': string;
        'textLink.activeForeground': string;
        'textBlockQuote.background': string;
        'textBlockQuote.border': string;
        'textCodeBlock.background': string;
        'input.background': any;
        'input.foreground': string;
        'input.border': string;
        'inputOption.activeBorder': string;
        'inputOption.activeBackground': any;
        'input.placeholderForeground': any;
        'dropdown.background': any;
        'dropdown.border': any;
        'checkbox.background': any;
        'checkbox.border': any;
        'button.background': string;
        'button.foreground': any;
        'badge.background': string;
        'badge.foreground': string;
        'scrollbar.shadow': string;
        'scrollbarSlider.background': any;
        'scrollbarSlider.hoverBackground': any;
        'scrollbarSlider.activeBackground': any;
        'progressBar.background': any;
        'editorError.background': string;
        'editorWarning.foreground': string;
        'editorInfo.foreground': string;
        'editorHint.foreground': string;
        'editor.background': string;
        'editor.foreground': string;
        'editor.selectionBackground': string;
        'editor.findMatchBackground': string;
        'list.dropBackground': string;
        'list.hoverBackground': string;
        'list.activeSelectionBackground': string;
        'list.activeSelectionForeground': any;
        'menu.foreground': string;
        'menu.background': any;
        'menu.separatorBackground': string;
        'panel.background': any;
        'panel.border': string;
        'panelTitle.activeForeground': string;
        'panelTitle.activeBorder': string;
        'activityBar.background': string;
        'activityBar.activeBorder': string;
        'activityBar.foreground': string;
        'statusBar.background': string;
        'statusBar.foreground': string;
    } | {
        workbenchBackground: string;
        foreground: string;
        errorForeground: string;
        descriptionForeground: any;
        'icon.foreground': string;
        focusBorder: string;
        contrastBorder: string;
        contrastActiveBorder: string;
        'textSeparator.foreground': any;
        'textLink.foreground': string;
        'textLink.activeForeground': string;
        'textBlockQuote.border': any;
        'textCodeBlock.background': any;
        'input.background': any;
        'input.foreground': string;
        'input.border': string;
        'inputOption.activeBorder': string;
        'input.placeholderForeground': any;
        'dropdown.background': any;
        'dropdown.listBackground': any;
        'dropdown.foreground': any;
        'dropdown.border': string;
        'checkbox.border': string;
        'button.foreground': any;
        'badge.background': any;
        'badge.foreground': any;
        'scrollbarSlider.background': any;
        'scrollbarSlider.hoverBackground': any;
        'scrollbarSlider.activeBackground': string;
        'progressBar.background': string;
        'editorError.border': any;
        'editorWarning.border': any;
        'editorInfo.border': any;
        'editorHint.border': any;
        'editor.background': any;
        'editor.foreground': any;
        'editor.selectionForeground': string;
        'menu.foreground': any;
        'menu.background': any;
        'menu.separatorBackground': string;
        'panel.border': string;
        'panelTitle.activeBorder': string;
        'panelTitle.activeForeground': string;
        'activityBar.background': string;
        'activityBar.activeBorder': string;
        'activityBar.foreground': string;
        'statusBar.background': string;
        'statusBar.foreground': string;
    };
}
declare module "src/services/theme/helper" {
    import { IColorTheme } from "src/model/colorTheme";
    import { editor as MonacoEditor } from 'monaco-editor';
    /**
     * This function convert colors object to CSS variables, and add it to the :root {}.
     * The default color id default contains dot punctuation, so there we convert the `.` to `-`.
     * More about the color token id, you need visit: https://code.visualstudio.com/api/references/theme-color
     * @param colors
     */
    export function convertToCSSVars(colors: object): string;
    export function getThemeData(theme: IColorTheme): MonacoEditor.IStandaloneThemeData;
}
declare module "src/services/theme/colorThemeService" {
    /**
     * VSCode theme extends guides: https://code.visualstudio.com/api/extension-guides/color-theme
     * https://code.visualstudio.com/api/references/theme-color
     */
    import 'reflect-metadata';
    import { IColorTheme, ColorThemeMode } from "src/model/colorTheme";
    import { GlobalEvent } from "src/common/event/index";
    export interface IColorThemeService {
        /**
         * Add themes into `colorThemes`
         *
         * This will update the duplicated themes found in `colorThemes`
         * @param themes
         */
        addThemes(themes: IColorTheme | IColorTheme[]): void;
        /**
         * Set the current Color Theme via id,
         * Please ensure the theme could be found in `colorThemes`
         * @param id The `id` is required
         */
        setTheme(id: string): void;
        /**
         * Update specific theme,
         * @param theme The `id` is required in theme
         */
        updateTheme(theme: IColorTheme): void;
        /**
         * Get all themes in `colorThemes`
         */
        getThemes(): IColorTheme[];
        /**
         * Get specific theme via id
         * @param id
         */
        getThemeById(id: string): IColorTheme | undefined;
        /**
         * Get the current Color Theme
         */
        getColorTheme(): IColorTheme;
        /**
         * Reload current theme
         */
        reload(): void;
        /**
         * Reset theme
         */
        reset(): void;
        /**
         * Get the mode('dark' or 'light') of the current Color Theme
         */
        getColorThemeMode(): ColorThemeMode;
        /**
         * Listen to the theme changed event
         * @param callback
         */
        onChange(callback: (prev: IColorTheme, next: IColorTheme, themeMode: ColorThemeMode) => void): void;
    }
    /**
     * @ignore
     */
    export const BuiltInColorTheme: IColorTheme;
    /**
     * @ignore
     */
    export const DEFAULT_THEME_CLASS_NAME: string;
    export class ColorThemeService extends GlobalEvent implements IColorThemeService {
        private colorThemes;
        private colorTheme;
        constructor();
        addThemes(themes: IColorTheme | IColorTheme[]): void;
        updateTheme(theme: IColorTheme): void;
        getThemeById(id: string): IColorTheme | undefined;
        getColorTheme(): IColorTheme;
        setTheme(id: string): void;
        getThemes(): IColorTheme[];
        reload(): void;
        reset(): void;
        getColorThemeMode(): ColorThemeMode;
        onChange(callback: (prev: IColorTheme, next: IColorTheme, themeMode: ColorThemeMode) => void): void;
    }
}
declare module "src/monaco/common" {
    export interface IDisposable {
        dispose(): void;
    }
    export enum KeybindingWeight {
        EditorCore = 0,
        EditorContrib = 100,
        WorkbenchContrib = 200,
        BuiltinExtension = 300,
        ExternalExtension = 400
    }
    export const CATEGORIES: {
        View: {
            value: any;
            original: string;
        };
        Help: {
            value: any;
            original: string;
        };
        Preferences: {
            value: any;
            original: string;
        };
        Developer: {
            value: any;
            original: string;
        };
    };
}
declare module "src/monaco/action" {
    import { ServicesAccessor } from 'monaco-editor/esm/vs/platform/instantiation/common/instantiation';
    import { IDisposable } from "src/monaco/common";
    export abstract class Action2 {
        readonly desc: Readonly<{
            /**
             * Specify visible in quick access view
             */
            f1: boolean;
            [key: string]: any;
        }>;
        static readonly ID: string;
        constructor(desc: Readonly<{
            /**
             * Specify visible in quick access view
             */
            f1: boolean;
            [key: string]: any;
        }>);
        abstract run(accessor: ServicesAccessor, ...args: any[]): any;
    }
    export function registerAction2(Ctor: {
        new (): Action2;
    }): IDisposable;
}
declare module "src/services/extensionService" {
    import 'reflect-metadata';
    import { IContribute, IExtension } from "src/model/extension";
    import { IDisposable } from "src/monaco/common";
    import type { UniqueId } from "src/common/types";
    import { Action2 } from "src/monaco/action";
    export interface IExtensionService {
        /**
         * Load the extension instances and then activate them.
         * Notice: The ExtensionService doesn't load an existed Extension, if you want inactivate
         * someone extension, there can use the `ExtensionService.inactive` method, also if you want
         * remove a extension, you can use the `ExtensionService.dispose` method.
         * @param extensions The extension array
         */
        load(extensions: IExtension[]): void;
        /**
         * Add the extensions to ExtensionService, but no activated.
         * @param extensions The Extensions wait to added
         * @returns Unload Extensions
         */
        add(extensions: IExtension[]): IExtension[] | null;
        /**
         * Activate the extensions (includes `contributes` type).
         * Notice: this method only do  the `activate` work, not store the data into ExtensionService,
         * which means you can't get the Extension by the `ExtensionService. getExtension` method.
         * @param extensions
         */
        activate(extensions: IExtension[]): void;
        /**
         * Get an extension by the ID
         * @param name The extension ID
         */
        getExtension(id: UniqueId): IExtension | undefined;
        /**
         * Get All loaded extensions
         * @return Extension Array
         */
        getAllExtensions(): IExtension[];
        /**
         * Dispose the specific extension, and remove it from the ExtensionService
         * @param extension The extension id is required
         */
        dispose(extensionId: UniqueId): void;
        /**
         * Dispose all extensions, and reset the ExtensionService
         */
        disposeAll(): void;
        /**
         * Disable to activate some extensions, make use of it to filter some
         * extensions no need to activate. You need register the inactive event before the MoleculeProvider declaration.
         * @example
         * ```ts
         *  molecule.extension.inactive((extension: IExtension) => {
         *      if (/^(idA|idB)$/.test(extension.id)) {
         *          return true;
         *      }
         *  });
         *  <MoleculeProvider extensions={[]}></MoleculeProvider>
         * ```
         * @param predicate The predicate function
         */
        inactive(predicate: (extension: IExtension) => boolean): void;
        /**
         * Register a new action which is extends the Action2, and return a disposable instance.
         * @example
         * ```ts
         * const action = class Action extends Action2 {};
         * const disposableAction = registerAction(action);
         * disposableAction.dispose(); // Dispose the action
         * ```
         * @param actionClass The action class
         * @return IDisposable The Disposable instance
         */
        registerAction(actionClass: {
            new (): Action2;
        }): IDisposable;
        /**
         * Execute the registered command
         * @param id The command ID
         * @param args
         */
        executeCommand(id: string, ...args: any): void;
        /**
         * Reset the extensions to `[]`
         */
        reset(): void;
        /**
         * Distinguish the language extensions from extensions
         * @param extensions
         * @returns [ languagesExts, otherExtensions ]
         */
        splitLanguagesExts(extensions: IExtension[]): [IExtension[], IExtension[]];
        /**
         * whether the extensions are loaded
         */
        isLoaded(): boolean;
        /**
         * Set the extensions are loaded
         */
        setLoaded(flag?: boolean): void;
    }
    export class ExtensionService implements IExtensionService {
        private extensions;
        private readonly colorThemeService;
        private readonly monacoService;
        private _inactive;
        private readonly localeService;
        /**
         * TODO: This property is used for marking the extensions were loaded
         * we are going to refactor this logic after redesign the Molecule lifecycle.
         */
        private _isLoaded;
        constructor();
        setLoaded(flag?: boolean): void;
        isLoaded(): boolean;
        getExtension(id: UniqueId): IExtension | undefined;
        reset(): void;
        getAllExtensions(): IExtension[];
        add(extensions: IExtension[]): IExtension[] | null;
        load(extensions: IExtension[]): void;
        loadContributes(contributes: IContribute): void;
        registerAction(ActionClass: {
            new (): Action2;
        }): IDisposable;
        executeCommand(id: any, ...args: any[]): void;
        activate(extensions: IExtension[]): void;
        dispose(extensionId: UniqueId): void;
        disposeAll(): void;
        inactive(predicate: (extension: IExtension) => boolean): void;
        private isInactive;
        splitLanguagesExts(extensions: IExtension[]): [IExtension[], IExtension[]];
    }
}
declare module "src/services/workbench/sidebarService" {
    import 'reflect-metadata';
    import { Component } from "src/react/index";
    import { ISidebar, ISidebarPane } from "src/model/workbench/sidebar";
    import type { UniqueId } from "src/common/types";
    export interface ISidebarService extends Component<ISidebar> {
        /**
         * Get a specific pane via id
         * @param id
         */
        get(id: UniqueId): ISidebarPane | undefined;
        /**
         * Add a new Sidebar pane
         * @param pane
         * @param isActive Whether to activate the current pane
         */
        add(pane: ISidebarPane, isActive?: boolean): void;
        /**
         * Update a specific pane
         * @param pane
         */
        update(pane: ISidebarPane): void;
        /**
         * Remove a pane
         * @param id
         */
        remove(id: UniqueId): void;
        /**
         * Set the specific pane as active
         * @param id
         */
        setActive(id?: UniqueId): void;
        /**
         * Reset the sidebar data
         */
        reset(): void;
    }
    export class SidebarService extends Component<ISidebar> implements ISidebarService {
        protected state: ISidebar;
        constructor();
        private getPane;
        get(id: UniqueId): any;
        add(data: ISidebarPane, isActive?: boolean): void;
        update(pane: ISidebarPane): void;
        remove(id: UniqueId): void;
        setActive(id?: UniqueId): void;
        reset(): void;
    }
}
declare module "src/services/workbench/activityBarService" {
    import 'reflect-metadata';
    import { Component } from "src/react/component";
    import { IActivityBar, IActivityBarItem } from "src/model/workbench/activityBar";
    import { IActivityMenuItemProps } from "src/model/index";
    import type { UniqueId } from "src/common/types";
    export interface IActivityBarService extends Component<IActivityBar> {
        /**
         * Reset the activityBar state data,
         * if you want to whole customize the activityBar, you can reset it first,
         * and then using the activityBar.add() method to fill the data you need.
         */
        reset(): void;
        /**
         * Add IActivityBarItem data
         * @param isActive If provide, Activity Bar will set data active automatically. Only works in one data
         */
        add(data: IActivityBarItem | IActivityBarItem[], isActive?: boolean): void;
        /**
         * Set active bar
         */
        setActive(id?: UniqueId): void;
        /**
         * Remove the specific activity bar by id
         * @param id
         */
        remove(id: UniqueId | UniqueId[]): void;
        /**
         * Toggle the specific activity bar between show or hide
         * @param id activity bar id
         */
        toggleBar(id: UniqueId): void;
        /**
         * Toggle the contextMenu between checked or unchecked
         * @param id contextmenu id
         */
        toggleContextMenuChecked(id: UniqueId): void;
        /**
         * Add new contextMenus for the activityBar
         */
        addContextMenu(data: IActivityMenuItemProps | IActivityMenuItemProps[]): void;
        /**
         * Remove the specific contextMenu item by id
         * @param id contextmenu id
         */
        removeContextMenu(id: UniqueId | UniqueId[]): void;
        /**
         * Add click event listener
         * @param callback
         */
        onClick(callback: (selectedKey: UniqueId, item: IActivityBarItem) => void): any;
        /**
         * Called when activity bar item which is not global is changed
         */
        onChange(callback: (prevSelectedKey?: UniqueId, nextSelectedKey?: UniqueId) => void): any;
    }
    export class ActivityBarService extends Component<IActivityBar> implements IActivityBarService {
        protected state: IActivityBar;
        private sidebarService;
        constructor();
        setActive(id?: UniqueId): void;
        reset(): void;
        add(data: IActivityBarItem | IActivityBarItem[], isActive?: boolean): void;
        private getRemoveList;
        remove(id: UniqueId | UniqueId[]): void;
        toggleBar(id: UniqueId): void;
        toggleContextMenuChecked(id: UniqueId): void;
        addContextMenu(contextMenu: IActivityMenuItemProps | IActivityMenuItemProps[]): void;
        removeContextMenu(id: UniqueId | UniqueId[]): void;
        onClick(callback: (selectedKey: UniqueId, item: IActivityBarItem) => void): void;
        onChange(callback: (prevSelectedKey?: UniqueId, nextSelectedKey?: UniqueId) => void): void;
    }
}
declare module "src/services/workbench/auxiliaryBarService" {
    import 'reflect-metadata';
    import React from 'react';
    import { Component } from "src/react/component";
    import { IAuxiliaryBar, IAuxiliaryBarMode, IAuxiliaryData } from "src/model/index";
    import type { UniqueId } from "src/common/types";
    export interface IAuxiliaryBarService extends Component<IAuxiliaryBar> {
        /**
         * Get the current tab
         */
        getCurrentTab(): IAuxiliaryData | undefined;
        addAuxiliaryBar(tabs: IAuxiliaryData[] | IAuxiliaryData): void;
        /**
         * Set the active one on data
         */
        setActive(current: UniqueId | undefined): void;
        /**
         * Set the mode of auxiliary bar
         */
        setMode: (mode: IAuxiliaryBarMode | ((preState: IAuxiliaryBarMode) => IAuxiliaryBarMode)) => IAuxiliaryBarMode;
        /**
         * Set the children of auxiliary bar
         */
        setChildren: (children: React.ReactNode) => void;
        /**
         * Called when auxiliary tab title clicked
         */
        onTabClick: (callback: (key: UniqueId) => void) => void;
        /**
         * Reset all states
         */
        reset: () => void;
    }
    export class AuxiliaryBarService extends Component<IAuxiliaryBar> implements IAuxiliaryBarService {
        state: IAuxiliaryBar;
        constructor();
        getCurrentTab: () => IAuxiliaryData;
        addAuxiliaryBar: (tabs: IAuxiliaryData | IAuxiliaryData[]) => void;
        setActive: (current: UniqueId | undefined) => void;
        setChildren: (children: React.ReactNode) => void;
        setMode: (mode: IAuxiliaryBarMode | ((preState: IAuxiliaryBarMode) => IAuxiliaryBarMode)) => IAuxiliaryBarMode;
        reset: () => void;
        onTabClick(callback: (key: UniqueId) => void): void;
    }
}
declare module "src/services/workbench/menuBarService" {
    import 'reflect-metadata';
    import type { UniqueId } from "src/common/types";
    import { IMenuBar, IMenuBarItem } from "src/model/workbench/menuBar";
    import { Component } from "src/react/index";
    export interface IMenuBarService extends Component<IMenuBar> {
        /**
         * Set the menus data
         * @param data
         */
        setMenus(data: IMenuBarItem[]): void;
        /**
         * Append a new menu into the specific menu found by `parentId`
         * @param menuItem the new menu
         * @param parentId
         */
        append(menuItem: IMenuBarItem, parentId: UniqueId): void;
        /**
         * Remove the specific menu item
         * @param menuId
         */
        remove(menuId: UniqueId): void;
        /**
         * Get the specific menu item
         * @param menuId
         */
        getMenuById(menuId: UniqueId): IMenuBarItem | undefined;
        /**
         * Update the specific menu item data
         * @param menuId
         * @param menuItem
         */
        update(menuId: UniqueId, menuItem: IMenuBarItem): void;
        /**
         * Reset menu bar data;
         */
        reset(): void;
        /**
         * listen to the onSelect event in menu
         * @param menuId
         */
        onSelect(callback: (menuId: UniqueId) => void): void;
    }
    export class MenuBarService extends Component<IMenuBar> implements IMenuBarService {
        protected state: IMenuBar;
        private sperator;
        constructor();
        /**
         * Get the specific menu reference type via menuId
         * @param menuId
         * @returns source is the target menu and path is the collections of indexs that contain the specific menu position
         */
        private getReferenceMenu;
        getMenuById(menuId: UniqueId): any;
        setMenus: (menuData: IMenuBarItem[]) => void;
        append(menuItem: IMenuBarItem, parentId: UniqueId): void;
        remove(menuId: UniqueId): void;
        update(menuId: UniqueId, menuItem?: IMenuBarItem): void;
        reset(): void;
        onSelect: (callback: (menuId: UniqueId) => void) => void;
    }
}
declare module "src/services/workbench/explorer/explorerService" {
    import 'reflect-metadata';
    import { Component } from "src/react/component";
    import { IExplorerPanelItem, IExplorer } from "src/model/workbench/explorer/explorer";
    import { IMenuItemProps } from "src/components/menu/index";
    import { IActionBarItemProps } from "src/components/index";
    import type { UniqueId } from "src/common/types";
    export interface IExplorerService extends Component<IExplorer> {
        /**
         * Add a new panel, as well as add a new data for toolbar data
         */
        addPanel(panel: IExplorerPanelItem | IExplorerPanelItem[]): void;
        /**
         * Update the panels data, as well as modify toolbar data
         */
        updatePanel(data: Partial<IExplorerPanelItem>): void;
        /**
         *
         * Set expanded Panels of Explore
         */
        setExpandedPanels(activePanelKeys: UniqueId[]): void;
        /**
         * Remove a panel via id, as well as remove the corresponding action bar
         */
        removePanel(id: UniqueId): void;
        /**
         * Toggle panel hidden, as well as toggle the toolbar status
         */
        togglePanel(id: UniqueId): void;
        /**
         * Only toggle the toolbar status
         */
        toggleHeaderBar(id: UniqueId): void;
        /**
         * Only add an action in toolbar actions
         */
        addAction(action: IMenuItemProps): void;
        /**
         * Get the specific action in toolbar actions
         * @param id
         */
        getAction(id: UniqueId): IMenuItemProps | undefined;
        /**
         * Update the action in toolbar actions
         * @param action
         */
        updateAction(action: Partial<IMenuItemProps>): void;
        /**
         * Remove the specific header toolbar action
         * @param id action id
         */
        removeAction(id: UniqueId): void;
        /**
         * Reset the ExplorerService state, it's mainly for customizing the Explorer
         */
        reset(): void;
        /**
         * Listen to the Explorer header toolbar click event
         * @param callback
         */
        onClick(callback: (e: MouseEvent, item: IActionBarItemProps) => void): any;
        /**
         * Listen to the Explorer panel remove event
         * @param callback
         */
        onRemovePanel(callback: (panel: IExplorerPanelItem) => void): void;
        /**
         * Listen to the FolderTree Panel collapse all folders event
         * @param callback
         */
        onCollapseAllFolders(callback: () => void): void;
        /**
         * Listen to the Explorer panel toolbar click event
         * @param callback
         */
        onPanelToolbarClick(callback: (panel: IExplorerPanelItem, toolbarId: string) => void): void;
    }
    export class ExplorerService extends Component<IExplorer> implements IExplorerService {
        protected state: IExplorer;
        constructor();
        setExpandedPanels(activePanelKeys: UniqueId[]): void;
        private toggleIcon;
        getAction(id: UniqueId): IMenuItemProps | undefined;
        updatePanel(data: Partial<IExplorerPanelItem>): void;
        updateAction(action: Partial<IMenuItemProps>): void;
        addPanel(data: IExplorerPanelItem | IExplorerPanelItem[]): void;
        addAction(action: IMenuItemProps | IMenuItemProps[]): void;
        removePanel(id: UniqueId): void;
        removeAction(id: UniqueId): void;
        togglePanel(id: UniqueId): void;
        toggleHeaderBar(id: UniqueId): void;
        reset(): void;
        onClick(callback: (e: MouseEvent, item: IActionBarItemProps) => void): void;
        onRemovePanel(callback: (panel: IExplorerPanelItem) => void): void;
        onCollapseAllFolders(callback: () => void): void;
        onPanelToolbarClick(callback: (panel: IExplorerPanelItem, toolbarId: string) => void): void;
    }
}
declare module "src/common/id" {
    export const ID_APP = "molecule";
    export const ID_ACTIVITY_BAR = "activityBar";
    export const ID_MENU_BAR = "menuBar";
    export const ID_SIDE_BAR = "sidebar";
    export const ID_EXPLORER = "explorer";
    export const ID_STATUS_BAR = "statusBar";
    export const ID_FOLDER_TREE = "folderTree";
    export const ID_EDITOR_TREE = "editorTree";
}
declare module "src/services/workbench/layoutService" {
    import { Component } from "src/react/index";
    import { ILayout, Position, MenuBarMode } from "src/model/workbench/layout";
    export interface ILayoutService extends Component<ILayout> {
        /**
         * Get the container of the molecule
         */
        readonly container: HTMLElement | null;
        /**
         * Toggle the visibility of menu bar, returns the status of menu bar's `hidden`
         */
        toggleMenuBarVisibility(): boolean;
        /**
         * Toggle the visibility of side bar, returns the status of side bar's `hidden`
         */
        toggleSidebarVisibility(): boolean;
        /**
         * Toggle the visibility of the panel, returns the status of panel's `hidden`
         */
        togglePanelVisibility(): boolean;
        /**
         * Toggle the visibility of the activity bar, returns the status of activity bar's `hidden`
         */
        toggleActivityBarVisibility(): boolean;
        /**
         * Toggle the visibility of the status bar, returns the status of status bar's `hidden`
         */
        toggleStatusBarVisibility(): boolean;
        /**
         * Toggle the maximized status of the panel, returns the status of maximized panel
         */
        togglePanelMaximized(): boolean;
        /**
         * Set the sizes between the side bar and main content area
         * @param splitPanePos
         */
        setPaneSize(splitPanePos: (number | string)[]): void;
        /**
         * Set the sizes between the editor and the panel
         * @param horizontalSplitPanePos
         */
        setHorizontalPaneSize(horizontalSplitPanePos: (number | string)[]): void;
        /**
         * Set the position of the side bar, default is in `left`
         * @param position
         * @unachieved
         */
        setSideBarPosition(position: keyof typeof Position): void;
        /**
         * Set the sizes between editor groups
         * @param groupSplitPos
         */
        setGroupSplitSize(groupSplitPos: (number | string)[]): void;
        /**
         * Set the mode of the MenuBar, default is `vertical`
         * @param mode
         * @unachieved
         */
        setMenuBarMode(mode: keyof typeof MenuBarMode): void;
        /**
         * Get the mode of the MenuBar
         */
        getMenuBarMode(): keyof typeof MenuBarMode;
        /**
         * Set the direction of editor group,default is `vertical`
         */
        setEditorGroupDirection(direction: MenuBarMode | ((prev: MenuBarMode) => MenuBarMode)): void;
        /**
         * Set the visibility of auxiliary bar
         *
         * Returns the next state of hidden
         */
        setAuxiliaryBar(hidden: boolean | ((preState: boolean) => boolean)): boolean;
        /**
         * Reset all layout data as default value
         */
        reset(): void;
        /**
         * Listen to the workbench did mount event
         * @param callback callback function
         */
        onWorkbenchDidMount(callback: Function): void;
    }
    export class LayoutService extends Component<ILayout> implements ILayoutService {
        protected state: ILayout;
        private _container;
        constructor();
        onWorkbenchDidMount(callback: Function): void;
        get container(): HTMLElement;
        toggleMenuBarVisibility(): boolean;
        togglePanelVisibility(): boolean;
        toggleSidebarVisibility(): boolean;
        toggleActivityBarVisibility(): boolean;
        toggleStatusBarVisibility(): boolean;
        setSideBarPosition(position: keyof typeof Position): void;
        togglePanelMaximized(): boolean;
        setPaneSize(splitPanePos: (number | string)[]): void;
        setHorizontalPaneSize(horizontalSplitPanePos: (number | string)[]): void;
        setGroupSplitSize(groupSplitPos: (string | number)[]): void;
        setMenuBarMode(mode: keyof typeof MenuBarMode): void;
        getMenuBarMode(): keyof typeof MenuBarMode;
        setEditorGroupDirection(direction: MenuBarMode | ((prev: MenuBarMode) => MenuBarMode)): void;
        setAuxiliaryBar(hidden: boolean | ((preState: boolean) => boolean)): boolean;
        reset(): void;
    }
}
declare module "src/services/workbench/editorService" {
    import 'reflect-metadata';
    import { Component } from "src/react/index";
    import { IEditor, IEditorGroup, IEditorTab, IEditorActionsProps, IEditorOptions } from "src/model/index";
    import { editor as MonacoEditor } from "src/monaco/index";
    import { IMenuItemProps } from "src/components/index";
    import { IExplorerService } from "src/services/workbench/explorer/explorerService";
    import type { UniqueId } from "src/common/types";
    import { ILayoutService } from "src/services/workbench/layoutService";
    export interface IEditorService extends Component<IEditor> {
        /**
         * Open a new tab in a specific group
         * @param tab Tab data
         * @param groupId Group ID
         */
        open<T = any>(tab: IEditorTab<T>, groupId?: UniqueId): void;
        /**
         * Get a tab from a specific group via the tab ID
         * @param tabId
         * @param groupId
         */
        getTabById<T>(tabId: UniqueId, groupId: UniqueId): IEditorTab<T> | undefined;
        /**
         * Update the specific tab, if the groupId provide, then update the tab of specific group
         * @param tab The id is required
         * @param groupId
         */
        updateTab(tab: IEditorTab, groupId?: UniqueId): IEditorTab;
        /**
         * Updates the editor content for a specific group
         * @param group The editorInstance is required
         * @param value
         */
        setGroupEditorValue(group: IEditorGroup, value: string): void;
        /**
         * Specify the Entry page of Workbench
         */
        setEntry(component: JSX.Element): void;
        /**
         * Judge the specific tabs whether opened in Editor view
         * @param tabId The tabId is required
         */
        isOpened(tabId: UniqueId): boolean;
        /**
         * Close the specific Tab opened in Editor Group view
         * @param tabId The tabId is required
         * @param groupId The groupId is required
         */
        closeTab(tabId: UniqueId, groupId: UniqueId): void;
        /**
         * Close other opened tabs in Editor Group
         * @param tab The id is required
         * @param groupId The groupId is required
         */
        closeOther(tab: IEditorTab, groupId: UniqueId): void;
        /**
         * Close the right opened tabs in Editor Group
         * @param tab The id is required, the start point of close to right
         * @param groupId The groupId is required
         */
        closeToRight(tab: IEditorTab, groupId: UniqueId): void;
        /**
         * Close the left opened Tabs in Editor Group
         * @param tab The id is required, the start point of close to left
         * @param groupId The groupId is required
         */
        closeToLeft(tab: IEditorTab, groupId: UniqueId): void;
        /**
         * Close the specific group all opened tabs
         * @param groupId The groupId is required
         */
        closeAll(groupId: UniqueId): void;
        /**
         * Get the specific group
         * @param groupId The groupId is required
         */
        getGroupById(groupId: UniqueId): IEditorGroup | undefined;
        /**
         * Clone a specific group, if the argument `groupId` is undefined,
         * there default clone the current group
         * @param groupId
         */
        cloneGroup(groupId?: UniqueId): IEditorGroup;
        /**
         * Listen to the Editor tab changed event
         * @param callback
         */
        onUpdateTab(callback: (tab: IEditorTab) => void): void;
        /**
         * Listen to the tab opening event
         * @param callback
         */
        onOpenTab(callback: (tab: IEditorTab) => void): void;
        /**
         * Listen to the tab move event
         * @param callback
         */
        onMoveTab(callback: (updateTabs: IEditorTab<any>[], groupId?: UniqueId) => void): any;
        /**
         * Listen to the tab select event
         * @param callback
         */
        onSelectTab(callback: (tabId: UniqueId, groupId?: UniqueId) => void): any;
        /**
         * Listen to the all tabs close event
         * @param callback
         */
        onCloseAll(callback: (groupId?: UniqueId) => void): any;
        /**
         * Listen to the tab close event
         * @param callback
         */
        onCloseTab(callback: (tabId: UniqueId, groupId?: UniqueId) => void): any;
        /**
         * Listen to the other tabs close event
         * @param callback
         */
        onCloseOther(callback: (tabItem: IEditorTab, groupId?: UniqueId) => void): any;
        /**
         * Listen to the left tabs close event
         * @param callback
         */
        onCloseToLeft(callback: (tabItem: IEditorTab, groupId?: UniqueId) => void): any;
        /**
         * Listen to the right tabs close event
         * @param callback
         */
        onCloseToRight(callback: (tabItem: IEditorTab, groupId?: UniqueId) => void): any;
        /**
         * Listen to the Group Actions click event
         * @param callback
         */
        onActionsClick(callback: (menuId: UniqueId, currentGroup: IEditorGroup) => void): void;
        /**
         * Set active group and tab
         * @param groupId Target group ID
         * @param tabId Target tab ID
         */
        setActive(groupId: UniqueId, tabId: UniqueId): any;
        /**
         * Update the specific group
         * @param groupId
         * @param groupValues
         */
        updateGroup(groupId: UniqueId, groupValues: Omit<IEditorGroup, 'id'>): void;
        /**
         * Set default actions when create a new group
         * @param actions
         */
        setDefaultActions(actions: IEditorActionsProps[]): void;
        /**
         * Set default menus when create a new group
         * @param menus
         */
        setDefaultMenus(menus: IMenuItemProps[]): void;
        /**
         * Update actions in specific group
         * @param actions
         * @param groupId
         */
        updateActions(actions: IMenuItemProps[], groupId?: UniqueId): void;
        /**
         * Update the current group
         * @param currentValues
         */
        updateCurrentGroup(currentValues: any): void;
        /**
         * Get the default group actions
         */
        getDefaultActions(): IEditorActionsProps[];
        /**
         * Get the default group menus
         */
        getDefaultMenus(): IMenuItemProps[];
        /**
         * Update the editor options
         * @param options
         */
        updateEditorOptions(options: IEditorOptions): void;
        /**
         * The instance of MonacoEditor
         */
        readonly editorInstance: MonacoEditor.IStandaloneCodeEditor;
        /**
         * Get the group's id which contains the tab
         * @param tabId
         */
        getGroupIdByTab(tabId: UniqueId): UniqueId | null;
        /**
         * Listen to the editor instance mount event
         */
        onEditorInstanceMount(callback: (editorInstance: MonacoEditor.IStandaloneCodeEditor) => void): void;
    }
    export class EditorService extends Component<IEditor> implements IEditorService {
        protected state: IEditor;
        protected defaultActions: IEditorActionsProps[];
        protected defaultMenus: IMenuItemProps[];
        protected explorerService: IExplorerService;
        protected layoutService: ILayoutService;
        constructor();
        updateEditorOptions(options: IEditorOptions): void;
        getDefaultActions(): any;
        getDefaultMenus(): any;
        private disposeModel;
        isOpened(tabId: UniqueId, filterGroups?: IEditorGroup<any, any>[]): boolean;
        setDefaultActions(actions: IEditorActionsProps[]): void;
        setDefaultMenus(menus: IMenuItemProps[]): void;
        setEntry(component: React.ReactNode): void;
        updateActions: (actions: IMenuItemProps[], groupId?: UniqueId) => void;
        getTabById<T>(tabId: UniqueId, groupId: UniqueId): IEditorTab<T> | undefined;
        get editorInstance(): any;
        updateTab(tab: IEditorTab, groupId?: UniqueId): IEditorTab;
        setGroupEditorValue(group: IEditorGroup, value: string): void;
        closeTab(tabId: UniqueId, groupId: UniqueId): void;
        closeOther(tab: IEditorTab, groupId: UniqueId): void;
        closeToRight(tab: IEditorTab, groupId: UniqueId): void;
        closeToLeft(tab: IEditorTab, groupId: UniqueId): void;
        getGroupById(groupId: UniqueId): IEditorGroup | undefined;
        getGroupIndexById(id: UniqueId): number;
        getGroupIdByTab(tabId: UniqueId): UniqueId;
        setActive(groupId: UniqueId, tabId: UniqueId): void;
        updateGroup(groupId: UniqueId, groupValues: Omit<IEditorGroup, 'id'>): void;
        updateCurrentGroup(currentValues: Partial<IEditorGroup>): void;
        /**
         * @param groupId If provided, will open tab in specific group
         */
        open<T>(tab: IEditorTab<T>, groupId?: UniqueId): void;
        onOpenTab(callback: (tab: IEditorTab) => void): void;
        closeAll(groupId: UniqueId): void;
        cloneGroup(groupId?: UniqueId): IEditorGroup;
        onUpdateTab(callback: (tab: IEditorTab) => void): void;
        onMoveTab(callback: (updateTabs: IEditorTab<any>[], groupId?: UniqueId) => void): void;
        onSelectTab(callback: (tabId: UniqueId, groupId?: UniqueId) => void): void;
        onCloseAll(callback: (groupId?: UniqueId) => void): void;
        onCloseTab(callback: (tabId: UniqueId, groupId?: UniqueId) => void): void;
        onCloseOther(callback: (tabItem: IEditorTab, groupId?: UniqueId) => void): void;
        onCloseToLeft(callback: (tabItem: IEditorTab, groupId?: UniqueId) => void): void;
        onCloseToRight(callback: (tabItem: IEditorTab, groupId?: UniqueId) => void): void;
        onActionsClick(callback: (menuId: UniqueId, currentGroup: IEditorGroup) => void): void;
        onEditorInstanceMount(callback: (editorInstance: MonacoEditor.IStandaloneCodeEditor) => void): void;
    }
}
declare module "src/services/workbench/statusBarService" {
    import 'reflect-metadata';
    import { Float, IStatusBar, IStatusBarItem } from "src/model/workbench/statusBar";
    import { Component } from "src/react/index";
    import type { UniqueId } from "src/common/types";
    export interface IStatusBarService extends Component<IStatusBar> {
        /**
         * Add a new StatusBar item into right or left status
         * @param item
         * @param float position the item to left or right
         */
        add(item: IStatusBarItem, float: Float): void;
        /**
         * Remove the specific StatusBar item
         * @param id
         * @param float if provided, it'll remove the item in spcific position
         */
        remove(id: UniqueId, float?: Float): void;
        /**
         * Update the specific StatusBar item, it'll update the item found in left
         * @param item the id field is required
         * @param float if provided, it'll update the item in specific position
         */
        update(item: IStatusBarItem, float?: Float): void;
        /**
         * Get the specific StatusBar item
         * @param id
         */
        getStatusBarItem(id: UniqueId, float?: Float): IStatusBarItem | null;
        /**
         * Reset the contextMenu data and the StatusBar data , including right and left
         */
        reset(): void;
        /**
         * Listen to the StatusBar click event
         * @param callback
         */
        onClick(callback: (e: MouseEvent, item: IStatusBarItem) => void): any;
    }
    export class StatusBarService extends Component<IStatusBar> implements IStatusBarService {
        protected state: IStatusBar;
        constructor();
        /**
         * Get the item informations in right position or left position
         * @param item
         * @returns
         */
        private getItem;
        add(item: IStatusBarItem<any>, float: Float): void;
        update(item: IStatusBarItem, float?: Float): void;
        getStatusBarItem(id: UniqueId, float?: Float): any;
        remove(id: UniqueId, float?: Float): void;
        reset(): void;
        onClick(callback: (e: MouseEvent, item: IStatusBarItem) => void): void;
    }
}
declare module "src/services/workbench/explorer/folderTreeService" {
    import 'reflect-metadata';
    import { Component } from "src/react/component";
    import { FileType, IFolderTree, IFolderTreeNodeProps } from "src/model/workbench/explorer/folderTree";
    import { IMenuItemProps } from "src/components/index";
    import type { UniqueId } from "src/common/types";
    export interface IFolderTreeService extends Component<IFolderTree> {
        /**
         * Reset the FolderTreeService state
         */
        reset(): void;
        /**
         * Add data into folder tree
         * @param data
         * @param id - Except adding a root folder, the id is required
         */
        add(data: IFolderTreeNodeProps, id?: UniqueId): void;
        /**
         * Remove specific data in folder tree
         * @param id
         */
        remove(id: UniqueId): void;
        /**
         * Update specific data in folder tree
         * @param data - The `id` property is required in data
         */
        update(data: IFolderTreeNodeProps): void;
        /**
         * Get specific data in folder tree
         * @param id
         */
        get(id: UniqueId): IFolderTreeNodeProps | null;
        /**
         * get the current treeNode's parentNode
         * @param id
         */
        getParentNode(id: UniqueId): IFolderTreeNodeProps | null;
        /**
         * Get the context menus for file
         */
        getFileContextMenu: () => IMenuItemProps[];
        /**
         * Get the context menus for folder
         */
        getFolderContextMenu: () => IMenuItemProps[];
        /**
         * Get the expandKeys in folderTree
         */
        getExpandKeys: () => UniqueId[];
        /**
         * Set the expandKeys for folderTree
         */
        setExpandKeys: (expandKeys: UniqueId[]) => void;
        /**
         * Get the loadedKeys for folderTree
         */
        getLoadedKeys: () => string[];
        /**
         * Set the loadedKeys for folderTree
         */
        setLoadedKeys: (loadedKeys: string[]) => void;
        /**
         * Active specific node,
         * or unactive any node in folder tree
         * @param id
         */
        setActive(id?: UniqueId): void;
        /**
         * Set a entry page for folder tree
         * @param entry
         */
        setEntry(entry: React.ReactNode): void;
        /**
         * Set the context menus for file
         * @param menus
         */
        setFileContextMenu: (menus: IMenuItemProps[]) => void;
        /**
         * Set the context menus for folder
         * @param menus
         */
        setFolderContextMenu: (menus: IMenuItemProps[]) => void;
        /**
         * Listen to event about clicking rename button
         * @param callback
         */
        onRename(callback: (id: UniqueId) => void): void;
        /**
         * Listen to remove a node
         * @param callback
         */
        onRemove(callback: (id: UniqueId) => void): void;
        /**
         * Listen to update file or folder name
         * @param callback
         */
        onUpdateFileName(callback: (file: IFolderTreeNodeProps) => void): void;
        /**
         * Listen to select a file
         * @param callback
         */
        onSelectFile(callback: (file: IFolderTreeNodeProps) => void): void;
        /**
         * Listen to drop event
         * @param treeData
         */
        onDropTree(callback: (source: IFolderTreeNodeProps, target: IFolderTreeNodeProps) => void): void;
        /**
         * Listen to right click event
         * @param callback
         */
        onRightClick(callback: (treeData: IFolderTreeNodeProps, menus: IMenuItemProps[]) => void): void;
        /**
         * Listen to create a node for folder tree
         * @param callback
         */
        onCreate(callback: (type: FileType, nodeId?: UniqueId) => void): void;
        /**
         * Listen to the click event about the context menu except for built-in menus
         * @param callback
         */
        onContextMenu(callback: (contextMenu: IMenuItemProps, treeNode?: IFolderTreeNodeProps) => void): void;
        /**
         * Callback for load folder tree data
         * @param callback
         */
        onLoadData(callback: (treeNode: IFolderTreeNodeProps, callback: (treeNode: IFolderTreeNodeProps) => void) => void): void;
        /**
         * Callback for expanding tree node
         * @param callback
         */
        onExpandKeys(callback: (expandKeys: UniqueId[]) => void): void;
        /**
         * Toggle whether to enable sorting, which is disabled by default.
         */
        toggleAutoSort(): void;
    }
    export class FolderTreeService extends Component<IFolderTree> implements IFolderTreeService {
        protected state: IFolderTree;
        private readonly explorerService;
        private readonly builtinService;
        private fileContextMenu;
        private folderContextMenu;
        constructor();
        private isHiddenFile;
        private sortTree;
        reset(): void;
        getFileContextMenu(): IMenuItemProps[];
        getParentNode(id: UniqueId): IFolderTreeNodeProps | null;
        setFileContextMenu(menus: IMenuItemProps[]): void;
        getFolderContextMenu(): IMenuItemProps[];
        setFolderContextMenu(menus: IMenuItemProps[]): void;
        getExpandKeys(): UniqueId[];
        setExpandKeys(expandKeys: UniqueId[]): void;
        getLoadedKeys(): string[];
        setLoadedKeys(loadedKeys: string[]): void;
        private setCurrentFolderLocation;
        /**
         * Returns the node of root folder in folderTree
         */
        private getRootFolderById;
        private addRootFolder;
        private getRootFolderIndex;
        private getCurrentRootFolderInfo;
        private getPosOfType;
        add(data: IFolderTreeNodeProps, id?: UniqueId): void;
        remove(id: UniqueId): void;
        update(data: IFolderTreeNodeProps): void;
        get(id: UniqueId): IFolderTreeNodeProps;
        setActive(id?: UniqueId): void;
        setEntry(entry: React.ReactNode): void;
        onRename(callback: (id: UniqueId) => void): void;
        onRemove(callback: (id: UniqueId) => void): void;
        onUpdateFileName(callback: (file: IFolderTreeNodeProps) => void): void;
        onSelectFile(callback: (file: IFolderTreeNodeProps) => void): void;
        onDropTree: (callback: (source: IFolderTreeNodeProps, target: IFolderTreeNodeProps) => void) => void;
        onRightClick: (callback: (treeData: IFolderTreeNodeProps, menus: IMenuItemProps[]) => void) => void;
        onCreate: (callback: (type: FileType, nodeId?: UniqueId) => void) => void;
        onContextMenu: (callback: (contextMenu: IMenuItemProps, treeNode?: IFolderTreeNodeProps) => void) => void;
        onLoadData: (callback: (treeNode: IFolderTreeNodeProps, callback: (treeNode: IFolderTreeNodeProps) => void) => void) => void;
        onExpandKeys: (callback: (expandKeys: UniqueId[]) => void) => void;
        toggleAutoSort(): void;
    }
}
declare module "src/services/workbench/explorer/editorTreeService" {
    import { IActionBarItemProps, IMenuItemProps, ITabProps } from "src/components/index";
    import { IEditor, IEditorTab } from "src/model/index";
    import { Component } from "src/react/index";
    import { UniqueId } from "src/common/types";
    export interface IEditorTreeService extends Component<IEditor> {
        /**
         * Callabck for close a certain tab
         * @param callback
         */
        onClose(callback: (tabId: UniqueId, groupId: UniqueId) => void): void;
        /**
         * Callback for close others tabs except this tabItem
         * @param callback
         */
        onCloseOthers(callback: (tabItem: IEditorTab, groupId: UniqueId) => void): void;
        /**
         * Callback for close saved tabs in this group
         * @param callback
         */
        onCloseSaved(callback: (groupId: UniqueId) => void): void;
        /**
         * Callback for select tab in this group
         * @param callback
         */
        onSelect(callback: (tabId: UniqueId, groupId: UniqueId) => void): void;
        /**
         * Callback for close all tabs
         * When specify groupId, it'll close that group
         * @param callback
         */
        onCloseAll(callback: (groupId?: UniqueId) => void): void;
        /**
         * Callback for save all tabs
         * When specify groupId, it'll save that group
         * @param callback
         */
        onSaveAll(callback: (groupId?: UniqueId) => void): void;
        /**
         * Callback for the click event from toolbar buttons, except for saving button and closing button,
         * if you want to subscribe to the click events for these two buttons, please use the methods of `onSaveAll` and `onCloseAll`
         * @param callback
         */
        onToolbarClick(callback: (toolbar: IActionBarItemProps, groupId?: UniqueId) => void): void;
        /**
         * Callback for adjust editor layout
         * @param callback
         */
        onLayout(callback: () => void): void;
        /**
         * Callback for context menu click event which isn't in buit-in menus
         * @param callback
         */
        onContextMenu(callback: (menu: IMenuItemProps, file: ITabProps, groupId: UniqueId) => void): void;
    }
    export class EditorTreeService extends Component<IEditor> implements IEditorTreeService {
        protected state: IEditor;
        private readonly editorService;
        constructor();
        onClose(callback: (tabId: UniqueId, groupId: UniqueId) => void): void;
        onCloseOthers(callback: (tabItem: IEditorTab, groupId: UniqueId) => void): void;
        onCloseSaved(callback: (groupId: UniqueId) => void): void;
        onSelect(callback: (tabId: UniqueId, groupId: UniqueId) => void): void;
        onCloseAll(callback: (groupId?: UniqueId) => void): void;
        onSaveAll(callback: (groupId?: UniqueId) => void): void;
        onToolbarClick(callback: (toolbar: IActionBarItemProps, groupId?: UniqueId) => void): void;
        onLayout(callback: () => void): void;
        onContextMenu(callback: (menu: IMenuItemProps, file: ITabProps, groupId: UniqueId) => void): void;
    }
}
declare module "src/services/builtinService/const" {
    import type { IActionBarItemProps, IMenuItemProps } from "src/components/index";
    import type { IActivityBarItem, IActivityMenuItemProps, IEditorActionsProps, IEditorOptions, IEditorTab, IExplorerPanelItem, IOutput, IPanelItem, IStatusBarItem } from "src/model/index";
    export const constants: {
        PANEL_PROBLEMS: string;
        STATUS_PROBLEMS: string;
        SAMPLE_FOLDER_PANEL_ID: string;
        EDITOR_PANEL_ID: string;
        OUTLINE_PANEL_ID: string;
        OUTLINE_PANEL_MORE_DESC: string;
        EXPLORER_ACTIVITY_ITEM: string;
        EXPLORER_ACTION_TITLE: string;
        EXPLORER_TOGGLE_VERTICAL: string;
        EXPLORER_TOGGLE_SAVE_ALL: string;
        EXPLORER_TOGGLE_CLOSE_ALL_EDITORS: string;
        EXPLORER_TOGGLE_SAVE_GROUP: string;
        EXPLORER_TOGGLE_CLOSE_GROUP_EDITORS: string;
        NEW_FILE_COMMAND_ID: string;
        NEW_FOLDER_COMMAND_ID: string;
        COLLAPSE_COMMAND_ID: string;
        RENAME_COMMAND_ID: string;
        REMOVE_COMMAND_ID: string;
        DELETE_COMMAND_ID: string;
        OPEN_TO_SIDE_COMMAND_ID: string;
        FIND_IN_WORKSPACE_ID: string;
        DOWNLOAD_COMMAND_ID: string;
        EDITOR_MENU_CLOSE_TO_RIGHT: string;
        EDITOR_MENU_CLOSE_TO_LEFT: string;
        EDITOR_MENU_CLOSE_ALL: string;
        EDITOR_MENU_CLOSE_OTHERS: string;
        EDITOR_MENU_CLOSE_SAVED: string;
        EDITOR_MENU_CLOSE: string;
        EDITOR_MENU_SHOW_OPENEDITORS: string;
        EDITOR_MENU_SPILIT: string;
        SETTING_ID: string;
        PROBLEM_MODEL_ID: string;
        PROBLEM_MODEL_NAME: string;
        NOTIFICATION_CLEAR_ALL_ID: string;
        NOTIFICATION_HIDE_ID: string;
        NOTIFICATION_MODEL_ID: string;
        NOTIFICATION_MODEL_NAME: string;
        STATUS_BAR_HIDE_ID: string;
        SEARCH_CASE_SENSITIVE_COMMAND_ID: string;
        SEARCH_WHOLE_WORD_COMMAND_ID: string;
        SEARCH_REGULAR_EXPRESSION_COMMAND_ID: string;
        SEARCH_PRESERVE_CASE_COMMAND_ID: string;
        SEARCH_REPLACE_ALL_COMMAND_ID: string;
        SEARCH_ACTIVITY_ITEM: string;
        SEARCH_TOOLBAR_REFRESH: string;
        SEARCH_TOOLBAR_CLEAR: string;
        SEARCH_TOOLBAR_COLLAPSE: string;
        PANEL_TOOLBOX_CLOSE: string;
        PANEL_TOOLBOX_RESIZE: string;
        PANEL_TOOLBOX_RESTORE_SIZE: string;
        PANEL_OUTPUT: string;
        MENU_APPEARANCE_ID: string;
        MENU_FILE_OPEN: string;
        MENU_QUICK_COMMAND: string;
        MENU_VIEW_MENUBAR: string;
        MENU_VIEW_AUXILIARY: string;
        MENU_VIEW_ACTIVITYBAR: string;
        MENU_VIEW_STATUSBAR: string;
        MENU_VIEW_PANEL: string;
        ACTION_QUICK_COMMAND: string;
        ACTION_QUICK_SELECT_ALL: string;
        ACTION_QUICK_COPY_LINE_UP: string;
        ACTION_QUICK_UNDO: string;
        ACTION_QUICK_REDO: string;
        ACTION_QUICK_CREATE_FILE: string;
        ACTION_QUICK_CREATE_FOLDER: string;
        ACTION_QUICK_ACCESS_SETTINGS: string;
        ACTION_SELECT_THEME: string;
        ACTION_SELECT_LOCALE: string;
        ACTIVITY_BAR_GLOBAL_SETTINGS: string;
        ACTIVITY_BAR_GLOBAL_ACCOUNT: string;
        CONTEXT_MENU_MENU: string;
        CONTEXT_MENU_EXPLORER: string;
        CONTEXT_MENU_SEARCH: string;
        CONTEXT_MENU_HIDE: string;
        MENUBAR_MODE_HORIZONTAL: string;
        MENUBAR_MODE_VERTICAL: string;
        MENUBAR_MENU_MODE_DIVIDER: string;
    };
    export const modules: {
        builtInExplorerActivityItem: () => IActivityBarItem;
        builtInExplorerFolderPanel: () => IExplorerPanelItem;
        builtInExplorerHeaderToolbar: () => IActionBarItemProps<any>;
        builtInExplorerEditorPanel: () => IExplorerPanelItem;
        builtInExplorerOutlinePanel: () => IExplorerPanelItem;
        BuiltInEditorOptions: () => IEditorOptions;
        builtInEditorInitialActions: () => IEditorActionsProps[];
        builtInEditorInitialMenu: () => IMenuItemProps[];
        builtInEditorTreeHeaderContextMenu: () => IMenuItemProps[];
        builtInEditorTreeContextMenu: () => IMenuItemProps[];
        BuiltInSettingsTab: () => IEditorTab<{
            language: string;
            value: string;
        }>;
        builtInStatusProblems: () => IStatusBarItem<any>;
        builtInPanelProblems: () => IPanelItem<any>;
        NOTIFICATION_CLEAR_ALL: () => IActionBarItemProps<any>;
        NOTIFICATION_HIDE: () => IActionBarItemProps<any>;
        builtInNotification: () => IStatusBarItem<any>;
        STATUS_EDITOR_INFO: () => {
            id: string;
            sortIndex: number;
            data: {
                ln: number;
                col: number;
            };
            name: string;
        };
        CONTEXT_MENU_HIDE_STATUS_BAR: () => IMenuItemProps;
        builtInSearchActivityItem: () => IActivityBarItem;
        builtInHeaderToolbar: () => IActionBarItemProps<any>[];
        builtInSearchAddons: () => IActionBarItemProps<any>[];
        builtInReplaceAddons: () => IActionBarItemProps<any>[];
        builtInOutputPanel: () => IOutput;
        builtInPanelToolboxResize: () => IActionBarItemProps<any>;
        builtInPanelToolboxReStore: () => IActionBarItemProps<any>;
        builtInPanelToolbox: () => IActionBarItemProps<any>;
        builtInMenuBarData: () => IMenuItemProps[];
        quickAcessViewAction: () => {
            id: string;
        };
        quickSelectColorThemeAction: () => {
            id: string;
        };
        quickAccessSettingsAction: () => {
            id: string;
        };
        quickSelectLocaleAction: () => {
            id: string;
        };
        quickTogglePanelAction: () => {
            id: string;
        };
        quickSelectAllAction: () => {
            id: string;
        };
        quickCopyLineUpAction: () => {
            id: string;
        };
        quickUndoAction: () => {
            id: string;
        };
        quickRedoAction: () => {
            id: string;
        };
        quickCreateFileAction: () => {
            id: string;
        };
        COMMON_CONTEXT_MENU: () => IMenuItemProps[];
        BASE_CONTEXT_MENU: () => IMenuItemProps[];
        ROOT_FOLDER_CONTEXT_MENU: () => IMenuItemProps[];
        FILE_CONTEXT_MENU: () => IMenuItemProps[];
        FOLDER_PANEL_CONTEXT_MENU: () => IMenuItemProps[];
        activityBarData: () => IActivityBarItem[];
        contextMenuData: () => IActivityMenuItemProps[];
    };
}
declare module "src/services/builtinService/index" {
    import 'reflect-metadata';
    import { constants, modules } from "src/services/builtinService/const";
    type IBuiltinModuleProps<T = any> = {
        id: string;
        module: () => T;
        /**
         * Before excuting the module, the value is empty
         */
        value?: T;
        active: boolean;
    };
    type IBuiltinConstantProps = {
        id: string;
        value: string;
        active: boolean;
    };
    export type IBuiltinProps = IBuiltinModuleProps & IBuiltinConstantProps;
    export interface IBuiltinService {
        /**
         * Mark the specific constant as inactive
         * @deprecated we're considering the necessary of this method, because it's useless for now to inactive a constant
         */
        inactiveConstant(id: keyof typeof constants): boolean;
        /**
         * Mark the specific module as inactive
         */
        inactiveModule(id: keyof typeof modules): boolean;
        /**
         * Get the specific constant by id
         */
        getConstant(id: keyof typeof constants): IBuiltinConstantProps | undefined;
        /**
         * Get all constants
         */
        getConstants(): Partial<typeof constants>;
        /**
         * Get the specific module by id
         */
        getModule<T>(id: keyof typeof modules): IBuiltinModuleProps<T> | undefined;
        /**
         * Get all modules
         */
        getModules(): any;
        /**
         * Reset all constants and modules
         */
        reset(): void;
    }
    export class BuiltinService implements IBuiltinService {
        private builtinConstants;
        private builtinModules;
        constructor();
        private initialize;
        private addConstant;
        private addModules;
        getConstant(id: keyof typeof constants): IBuiltinConstantProps;
        getConstants(): Record<Partial<"PANEL_PROBLEMS" | "STATUS_PROBLEMS" | "SAMPLE_FOLDER_PANEL_ID" | "EDITOR_PANEL_ID" | "OUTLINE_PANEL_ID" | "OUTLINE_PANEL_MORE_DESC" | "EXPLORER_ACTIVITY_ITEM" | "EXPLORER_ACTION_TITLE" | "EXPLORER_TOGGLE_VERTICAL" | "EXPLORER_TOGGLE_SAVE_ALL" | "EXPLORER_TOGGLE_CLOSE_ALL_EDITORS" | "EXPLORER_TOGGLE_SAVE_GROUP" | "EXPLORER_TOGGLE_CLOSE_GROUP_EDITORS" | "NEW_FILE_COMMAND_ID" | "NEW_FOLDER_COMMAND_ID" | "COLLAPSE_COMMAND_ID" | "RENAME_COMMAND_ID" | "REMOVE_COMMAND_ID" | "DELETE_COMMAND_ID" | "OPEN_TO_SIDE_COMMAND_ID" | "FIND_IN_WORKSPACE_ID" | "DOWNLOAD_COMMAND_ID" | "EDITOR_MENU_CLOSE_TO_RIGHT" | "EDITOR_MENU_CLOSE_TO_LEFT" | "EDITOR_MENU_CLOSE_ALL" | "EDITOR_MENU_CLOSE_OTHERS" | "EDITOR_MENU_CLOSE_SAVED" | "EDITOR_MENU_CLOSE" | "EDITOR_MENU_SHOW_OPENEDITORS" | "EDITOR_MENU_SPILIT" | "SETTING_ID" | "PROBLEM_MODEL_ID" | "PROBLEM_MODEL_NAME" | "NOTIFICATION_CLEAR_ALL_ID" | "NOTIFICATION_HIDE_ID" | "NOTIFICATION_MODEL_ID" | "NOTIFICATION_MODEL_NAME" | "STATUS_BAR_HIDE_ID" | "SEARCH_CASE_SENSITIVE_COMMAND_ID" | "SEARCH_WHOLE_WORD_COMMAND_ID" | "SEARCH_REGULAR_EXPRESSION_COMMAND_ID" | "SEARCH_PRESERVE_CASE_COMMAND_ID" | "SEARCH_REPLACE_ALL_COMMAND_ID" | "SEARCH_ACTIVITY_ITEM" | "SEARCH_TOOLBAR_REFRESH" | "SEARCH_TOOLBAR_CLEAR" | "SEARCH_TOOLBAR_COLLAPSE" | "PANEL_TOOLBOX_CLOSE" | "PANEL_TOOLBOX_RESIZE" | "PANEL_TOOLBOX_RESTORE_SIZE" | "PANEL_OUTPUT" | "MENU_APPEARANCE_ID" | "MENU_FILE_OPEN" | "MENU_QUICK_COMMAND" | "MENU_VIEW_MENUBAR" | "MENU_VIEW_AUXILIARY" | "MENU_VIEW_ACTIVITYBAR" | "MENU_VIEW_STATUSBAR" | "MENU_VIEW_PANEL" | "ACTION_QUICK_COMMAND" | "ACTION_QUICK_SELECT_ALL" | "ACTION_QUICK_COPY_LINE_UP" | "ACTION_QUICK_UNDO" | "ACTION_QUICK_REDO" | "ACTION_QUICK_CREATE_FILE" | "ACTION_QUICK_CREATE_FOLDER" | "ACTION_QUICK_ACCESS_SETTINGS" | "ACTION_SELECT_THEME" | "ACTION_SELECT_LOCALE" | "ACTIVITY_BAR_GLOBAL_SETTINGS" | "ACTIVITY_BAR_GLOBAL_ACCOUNT" | "CONTEXT_MENU_MENU" | "CONTEXT_MENU_EXPLORER" | "CONTEXT_MENU_SEARCH" | "CONTEXT_MENU_HIDE" | "MENUBAR_MODE_HORIZONTAL" | "MENUBAR_MODE_VERTICAL" | "MENUBAR_MENU_MODE_DIVIDER">, string>;
        inactiveConstant(id: keyof typeof constants): boolean;
        inactiveModule(id: keyof typeof modules): boolean;
        getModule(id: keyof typeof modules): any;
        getModules(): any;
        reset(): void;
    }
    export default BuiltinService;
}
declare module "src/services/workbench/searchService" {
    import 'reflect-metadata';
    import { Component } from "src/react/component";
    import { ISearchProps } from "src/model/workbench/search";
    import { ITreeNodeItemProps } from "src/components/index";
    export interface ISearchService extends Component<ISearchProps> {
        /**
         * Set informations about validating,
         * @param info - If provided a string, molecule will set it type as `info`
         */
        setValidateInfo: (info: string | ISearchProps['validationInfo']) => void;
        /**
         * Set search value for search input
         */
        setSearchValue: (value?: string) => void;
        /**
         * Set replace value for replace input
         */
        setReplaceValue: (value?: string) => void;
        /**
         * Set result data for searching result
         */
        setResult: (value?: ITreeNodeItemProps[]) => void;
        /**
         * Toggle search mode, `true` for replace mode
         */
        toggleMode: (status: boolean) => void;
        /**
         * Toggle the rule for case senstitive when searching
         */
        toggleCaseSensitive: () => void;
        /**
         * Toggle the rule for finding whole word when searching
         */
        toggleWholeWord: () => void;
        /**
         * Toggle the rule for enabling regex when searching
         */
        toggleRegex: () => void;
        /**
         * Toggle the rule for preserving case when replacing
         */
        togglePreserveCase: () => void;
        /**
         * Update the status of specific addon icon to `checked`
         */
        updateStatus: (addonId: string, checked: boolean) => void;
        /**
         * Reset the search input data
         */
        reset(): void;
        /**
         * Listen to the event about the value of search input changed
         */
        onChange(callback: (value: string, replaceValue: string) => void): void;
        /**
         * Listen to the event about going to search result via values or config changed
         */
        onSearch(callback: (value: string, replaceValue: string, config: {
            isRegex: boolean;
            isCaseSensitive: boolean;
            isWholeWords: boolean;
            preserveCase: boolean;
        }) => void): void;
        /**
         * Listen to the event about replace all text in result
         */
        onReplaceAll(callback: () => void): void;
        /**
         * Listen to the click event in result data
         */
        onResultClick(callback: (item: ITreeNodeItemProps, resultData: ITreeNodeItemProps[]) => void): void;
    }
    export class SearchService extends Component<ISearchProps> implements ISearchService {
        protected state: ISearchProps;
        private builtinService;
        constructor();
        setValidateInfo(info: string | ISearchProps['validationInfo']): void;
        setSearchValue(value?: string): void;
        setReplaceValue(value?: string): void;
        setResult(value?: ITreeNodeItemProps[]): void;
        toggleMode(status: boolean): void;
        toggleCaseSensitive(): void;
        toggleWholeWord(): void;
        toggleRegex(): void;
        togglePreserveCase(): void;
        updateStatus(addonId: string, checked: boolean): void;
        reset(): void;
        onReplaceAll(callback: () => void): void;
        onChange(callback: (value: string, replaceValue: string) => void): void;
        onSearch(callback: (value: string, replaceValue: string, config: {
            isRegex: boolean;
            isCaseSensitive: boolean;
            isWholeWords: boolean;
            preserveCase: boolean;
        }) => void): void;
        onResultClick(callback: (item: ITreeNodeItemProps, resultData: ITreeNodeItemProps[]) => void): void;
    }
}
declare module "src/services/workbench/panelService" {
    import 'reflect-metadata';
    import { editor as MonacoEditor } from 'monaco-editor';
    import { Component } from "src/react/index";
    import { IPanel, IPanelItem } from "src/model/workbench/panel";
    import { IActionBarItemProps } from "src/components/actionBar/index";
    import type { UniqueId } from "src/common/types";
    export interface IPanelService extends Component<IPanel> {
        /**
         * The editorInstance of Output
         */
        readonly outputEditorInstance: MonacoEditor.IStandaloneCodeEditor | undefined;
        /**
         * Set the current active panel
         *
         * This method will log error when couldn't find target panel in state data.
         * So if you want to add a panel and meanwhile active it, please use the `open` method
         * @param id target panel id
         */
        setActive(id: UniqueId): void;
        /**
         * Open a new or existing panel item as the active in Panel view
         * @param panel
         */
        open(panel: IPanelItem): void;
        /**
         * Get the specific panel
         * @param id
         */
        getPanel(id: UniqueId): IPanelItem | undefined;
        /**
         * Add new Panel items
         * @param data
         */
        add(data: IPanelItem | IPanelItem[]): void;
        /**
         * Update the specific panel
         * @param panel the id field is required
         */
        update(panel: IPanelItem): IPanelItem | undefined;
        /**
         * Update the Output panel, except the value
         *
         * If you want to update the value of this panel, please use the `appendOutput` method
         * @param panel
         */
        updateOutput(panel: IPanelItem): IPanelItem | undefined;
        /**
         * Remove the specific panel
         * @param id
         */
        remove(id: UniqueId): IPanelItem | undefined;
        /**
         * Toggle the panel between maximized or normal
         */
        toggleMaximize(): void;
        /**
         * Listen to the Panel tabs onChange event
         * @param callback
         */
        onTabChange(callback: (panelId: UniqueId) => void): void;
        /**
         * Listen to the Panel toolbar click event
         * @param callback
         */
        onToolbarClick(callback: (e: React.MouseEvent, item: IActionBarItemProps) => void): void;
        /**
         * Listen to the Panel tabs close event
         * @param callback
         */
        onTabClose(callback: (panelId: UniqueId) => void): void;
        /**
         * Get the value of Output Panel
         */
        getOutputValue(): string;
        /**
         * Append the content into Output panel
         * @param content
         */
        appendOutput(content: string): void;
        /**
         * Clean the Output content
         */
        cleanOutput(): void;
        /**
         * Reset data in state
         */
        reset(): void;
    }
    export class PanelService extends Component<IPanel> implements IPanelService {
        protected state: IPanel;
        private readonly layoutService;
        private readonly builtinService;
        constructor();
        private updateOutputProperty;
        get outputEditorInstance(): MonacoEditor.IStandaloneCodeEditor;
        setActive(id: UniqueId): void;
        toggleMaximize(): void;
        open(data: IPanelItem<any>): void;
        getPanel(id: UniqueId): IPanelItem<any> | undefined;
        getOutputValue(): any;
        /**
         * Onyl support to update several properties
         */
        updateOutput(data: Partial<IPanelItem>): IPanelItem | undefined;
        appendOutput(content: string): void;
        cleanOutput(): void;
        add(data: IPanelItem | IPanelItem[]): void;
        update(data: IPanelItem): IPanelItem | undefined;
        remove(id: UniqueId): IPanelItem | undefined;
        reset(): void;
        onTabChange(callback: (key: UniqueId) => void): void;
        onToolbarClick(callback: (e: React.MouseEvent, item: IActionBarItemProps) => void): void;
        onTabClose(callback: (key: UniqueId) => void): void;
    }
}
declare module "src/services/workbench/index" {
    export * from "src/services/workbench/activityBarService";
    export * from "src/services/workbench/auxiliaryBarService";
    export * from "src/services/workbench/menuBarService";
    export * from "src/services/workbench/sidebarService";
    export * from "src/services/workbench/editorService";
    export * from "src/services/workbench/statusBarService";
    export * from "src/services/workbench/explorer/explorerService";
    export * from "src/services/workbench/explorer/folderTreeService";
    export * from "src/services/workbench/explorer/editorTreeService";
    export * from "src/services/workbench/searchService";
    export * from "src/services/workbench/panelService";
    export * from "src/services/workbench/layoutService";
}
declare module "src/model/settings" {
    import { IEditorOptions } from "src/model/workbench/index";
    /**
     * The Settings configuration event definition
     */
    export enum SettingsEvent {
        /**
         * The settings content changed
         */
        OnChange = "settings.onchange"
    }
    export interface ISettings {
        colorTheme?: string;
        editor?: IEditorOptions;
        locale?: string;
        [index: string]: any;
    }
    export class SettingsModel implements ISettings {
        colorTheme: string;
        editor: IEditorOptions;
        locale?: string;
        constructor(colorTheme: string, editor: IEditorOptions, locale?: string);
        [key: string]: any;
    }
}
declare module "src/services/settingsService" {
    import 'reflect-metadata';
    import { ISettings } from "src/model/settings";
    import { GlobalEvent } from "src/common/event/index";
    import { IEditorTab } from "src/model/index";
    import { modules } from "src/services/builtinService/const";
    export type BuiltInSettingsTabType = ReturnType<typeof modules.BuiltInSettingsTab>;
    export interface ISettingsService {
        /**
         * Append new Settings object
         * eg: `
         *  append({ project: { name: 'example' } })
         * `
         * @param settings object
         */
        append(settings: ISettings): void;
        /**
         * To update a settings object, it's going to overwrite
         * a settings item if it existed.
         * @param settings
         */
        update(settings: ISettings): void;
        /**
         * Get the settings object
         */
        getSettings(): ISettings;
        /**
         * It converts an object to a flatted object,
         * eg: { a: { b: 'test' }}, result is : { 'a.b': 'test' }.
         * @param obj object
         */
        flatObject(obj: object): object;
        /**
         * It converts an object to a flatted json string,
         * eg: { a: { b: 'test' }}, result is : `{ 'a.b': 'test' }`.
         * @param obj object
         */
        flatObject2JSONString(obj: object): string;
        /**
         * It converts a flatted JSON string to a normal object,
         * eg: `{ 'a.b': 'test' }` result is : { a: { b: 'test' }}.
         * @param jsonStr string
         * @return T
         */
        normalizeFlatObject<T = ISettings>(jsonStr: string): T;
        /**
         * It converts an object to JSON string
         */
        toJSONString(obj: object, space?: number): string;
        /**
         * Open the `settings.json` in the Editor Panel
         */
        openSettingsInEditor(): void;
        /**
         * Apply the nextSettings configuration
         * @param nextSettings
         */
        applySettings(nextSettings: ISettings): void;
        /**
         * Listen to the Settings change event.
         * @param callback
         */
        onChangeSettings(callback: (tab: IEditorTab<BuiltInSettingsTabType>) => void): void;
        /**
         * Get the default Settings Tab object
         */
        getDefaultSettingsTab(): BuiltInSettingsTabType;
    }
    export class SettingsService extends GlobalEvent implements ISettingsService {
        protected settings: ISettings;
        private readonly editorService;
        private readonly colorThemeService;
        private readonly localeService;
        private readonly builtinService;
        constructor();
        private getBuiltInSettings;
        getDefaultSettingsTab(): BuiltInSettingsTabType;
        onChangeSettings(callback: (tab: IEditorTab<BuiltInSettingsTabType>) => void): void;
        update(settings: ISettings): void;
        append(settings: ISettings): void;
        getSettings(): ISettings;
        applySettings(nextSettings: ISettings): void;
        openSettingsInEditor(): void;
        normalizeFlatObject<T = ISettings>(jsonStr: string): T;
        flatObject(obj: object): object;
        flatObject2JSONString(obj: object): string;
        toJSONString(obj: object, space?: number): string;
    }
}
declare module "src/model/notification" {
    import { UniqueId } from "src/common/types";
    import { IActionBarItemProps } from "src/components/actionBar/index";
    import React from 'react';
    import type { IStatusBarItem } from "src/model/workbench/statusBar";
    export enum NotificationStatus {
        Read = 1,
        WaitRead = 2
    }
    export interface INotificationItem<T = any> {
        id: UniqueId;
        value: T;
        render?(item: INotificationItem): React.ReactNode;
        status?: NotificationStatus;
    }
    export interface INotification<T = any> extends IStatusBarItem<INotificationItem<T>[]> {
        showNotifications?: boolean;
        actionBar?: IActionBarItemProps[];
    }
    export class NotificationModel<T> implements INotification<T> {
        id: UniqueId;
        name: string;
        data: INotificationItem<T>[];
        sortIndex: number;
        render: () => React.ReactNode;
        showNotifications: boolean;
        actionBar: IActionBarItemProps[];
        constructor(id: UniqueId, name: string, data: INotificationItem<T>[], sortIndex: number, showNotifications: boolean, actionBar: IActionBarItemProps[], render: () => React.ReactNode);
    }
}
declare module "src/services/notificationService" {
    import 'reflect-metadata';
    import { INotification, INotificationItem } from "src/model/notification";
    import { Component } from "src/react/index";
    import type { UniqueId } from "src/common/types";
    export interface INotificationService extends Component<INotification> {
        /**
         * Add new notification items
         * @param items
         */
        add<T>(items: INotificationItem<T>[]): null | INotificationItem<T>[];
        /**
         * Remove the specific notification item by id
         * @param id
         */
        remove(id: UniqueId): void;
        /**
         * Update the specific notification item
         * @param item notification item, the id field is required
         */
        update<T>(item: INotificationItem<T>): null | INotificationItem<T>;
        /**
         * Toggle the Notification view between display or hidden
         */
        toggleNotification(): void;
        /**
         * Clear the notifications
         */
        clear(): void;
        /**
         * Reset notifications, this will clear the pending notifications
         */
        reset(): void;
    }
    export class NotificationService extends Component<INotification> implements INotificationService {
        protected state: INotification;
        constructor();
        toggleNotification(): void;
        update<T>(item: INotificationItem<T>): INotificationItem<T> | null;
        remove(id: UniqueId): void;
        add<T>(items: INotificationItem<T>[]): null | INotificationItem<T>[];
        clear(): void;
        reset(): void;
    }
}
declare module "src/model/problems" {
    import type { UniqueId } from "src/common/types";
    import { ITreeNodeItemProps } from "src/components/index";
    export enum MarkerSeverity {
        Hint = 1,
        Info = 2,
        Warning = 4,
        Error = 8
    }
    export enum ProblemsEvent {
        onSelect = "problems.onSelect"
    }
    export interface IRelatedInformation {
        code: string;
        message: string;
        startLineNumber: number;
        startColumn: number;
        endLineNumber: number;
        endColumn: number;
        status: MarkerSeverity;
    }
    export interface IProblemsItem<T = any> extends ITreeNodeItemProps {
        value: IRelatedInformation;
        children: IProblemsItem[];
    }
    export interface IProblemsTreeNode<T = any> extends ITreeNodeItemProps {
        value?: IRelatedInformation;
        children?: IProblemsTreeNode[];
    }
    export interface IProblems<T = any> {
        id: UniqueId;
        name: string;
        data: IProblemsItem<T>[];
        show?: boolean;
        onSelect?: (node: IProblemsTreeNode) => void;
    }
    export class ProblemsModel<T> implements IProblems<T> {
        id: UniqueId;
        name: string;
        data: IProblemsItem<T>[];
        show: boolean;
        constructor(id?: UniqueId, name?: string, data?: IProblemsItem<T>[], show?: boolean);
    }
}
declare module "src/services/problemsService" {
    import 'reflect-metadata';
    import { IProblems, IProblemsItem, IProblemsTreeNode } from "src/model/problems";
    import { Component } from "src/react/index";
    import type { UniqueId } from "src/common/types";
    export interface IProblemsService extends Component<IProblems> {
        /**
         * Add single or multiple items data
         * @param data
         */
        add(data: IProblemsItem | IProblemsItem[]): void;
        /**
         * Remove the specific problem items
         * @param id single or multiple ids
         */
        remove(id: UniqueId | UniqueId[]): void;
        /**
         * Reset the ProblemsService state data
         */
        reset(): void;
        /**
         * Update the specific data
         * @param data single or multiple problems
         */
        update<T>(data: IProblemsItem<T> | IProblemsItem<T>[]): void;
        /**
         * Toggle the Problems view between display or hidden
         */
        toggleProblems(): void;
        /**
         * Listen to select a problem tree node
         * @param callback
         */
        onSelect(callback: (node: IProblemsTreeNode) => void): void;
    }
    export class ProblemsService extends Component<IProblems> implements IProblemsService {
        protected state: IProblems;
        private readonly statusBarService;
        private readonly builtinService;
        constructor();
        toggleProblems(): void;
        add<T>(item: IProblemsItem<T> | IProblemsItem<T>[]): void;
        update<T>(item: IProblemsItem<T> | IProblemsItem<T>[]): void;
        remove(id: UniqueId | UniqueId[]): void;
        reset(): void;
        onSelect(callback: (node: IProblemsTreeNode) => void): void;
        private updateStatusBar;
        private updateStatus;
        private getProblemsMarkers;
    }
}
declare module "src/services/index" {
    export type { IExtensionService } from "src/services/extensionService";
    export * from "src/services/theme/colorThemeService";
    export * from "src/services/workbench/index";
    export * from "src/services/settingsService";
    export * from "src/services/notificationService";
    export * from "src/services/problemsService";
    export * from "src/services/builtinService/index";
    export * from "src/services/extensionService";
}
declare module "src/model/iconTheme" {
    /**
     * File icons for Molecule
     */
    export interface IIconTheme {
    }
}
declare module "src/model/extension" {
    import type { UniqueId } from "src/common/types";
    import { IExtensionService } from "src/services/index";
    import { IColorTheme } from "src/model/colorTheme";
    import { IIconTheme } from "src/model/iconTheme";
    import { ILocale } from "src/i18n/index";
    /**
     * Defines extension types
     */
    export enum IExtensionType {
        Theme = "Themes",
        Normal = "normal",
        Settings = "settings",
        Locals = "locales",
        Menus = "menus",
        Workbench = "workbench"
    }
    export enum IContributeType {
        Languages = "languages",
        Commands = "commands",
        Configuration = "configuration",
        Grammar = "grammars",
        Themes = "themes",
        IconTheme = "iconThemes"
    }
    export interface IContribute {
        [IContributeType.Languages]?: ILocale[];
        [IContributeType.Commands]?: any;
        [IContributeType.Configuration]?: any;
        [IContributeType.Grammar]?: any;
        [IContributeType.Themes]?: IColorTheme[];
        [IContributeType.IconTheme]?: IIconTheme[];
    }
    /**
     * The interface of extension,
     * there need every extension to implement this interface
     */
    export interface IExtension {
        /**
         * The ID of extension required
         */
        id: UniqueId;
        /**
         * The name of extension
         */
        name: string;
        /**
         * The display name of extension
         */
        displayName?: string;
        /**
         * The version of extension
         */
        version?: string;
        /**
         * The categories of extension
         */
        categories?: IExtensionType[];
        /**
         * The kind of extension
         */
        extensionKind?: IExtensionType[];
        /**
         * The main file path of extension
         * Extension system will load the extension by this file
         */
        contributes?: IContribute;
        /**
         * The entry of extension
         */
        main?: string;
        /**
         * The Icon of extension
         */
        icon?: string | JSX.Element;
        /**
         * The description of extension
         */
        description?: string;
        /**
         * The publisher of extension
         */
        publisher?: string;
        /**
         * The path of extension
         */
        path?: string;
        /**
         * Whether disable current extension, the extension default status is enable
         */
        disable?: boolean;
        /**
         * Do something you want when the Extension is activating.
         * The ExtensionService will call the `activate` method after
         * added the Extension instance.
         * @param extensionCtx The Context of Extension instance
         */
        activate(extensionCtx: IExtensionService): void;
        /**
         * Do something when the Extension disposing.
         * For example, you can recover the UI state, or remove the Objects in memory.
         * @param extensionCtx The Context of Extension instance
         */
        dispose(extensionCtx: IExtensionService): void;
    }
}
declare module "src/model/keybinding" {
    import { KeyCode } from "src/monaco/index";
    export const KeyCodeString: Partial<{
        [key in KeyCode]: string;
    }>;
    export interface ISimpleKeybinding {
        ctrlKey: boolean;
        shiftKey: boolean;
        altKey: boolean;
        metaKey: boolean;
        keyCode: KeyCode;
    }
}
declare module "src/model/index" {
    export * from "src/model/workbench/index";
    export * from "src/model/extension";
    export * from "src/model/iconTheme";
    export * from "src/model/settings";
    export * from "src/model/notification";
    export * from "src/model/problems";
    export * from "src/model/colorTheme";
    export * from "src/model/keybinding";
}
declare module "src/components/tabs/tabExtra" {
    import React from 'react';
    interface ITabExtraProps {
        classNames?: string;
        onClick?: React.MouseEventHandler<HTMLDivElement>;
        renderStatus?: (hover: boolean) => JSX.Element;
    }
    const _default_2: ({ onClick, classNames, renderStatus }: ITabExtraProps) => React.JSX.Element;
    export default _default_2;
}
declare module "src/components/tabs/tab" {
    import React from 'react';
    import { IEditorGroup } from "src/model/index";
    import type { UniqueId } from "src/common/types";
    export interface ITabEvent {
        onDrag?: (source: ITabProps, target: ITabProps, dragInfos: Record<string, any>) => void;
        onCloseTab?: (key: UniqueId) => void;
        onSelectTab?: (key: UniqueId) => void;
        onContextMenu?: <T = any>(event: React.MouseEvent, tab: ITabProps<T>) => void;
    }
    type ITabStatus = 'edited';
    /**
     * The type definition for the Tab data construct
     */
    export interface ITabProps<T = any, P = any> {
        /**
         * @deprecated Tab doesn't need this property, but the type extends from tab need
         */
        active?: boolean;
        /**
         * Mark the tab status to be closable,
         * Default is true
         */
        closable?: boolean;
        /**
         * Mark the tab status to be editing
         */
        editable?: boolean;
        status?: ITabStatus | ((tab: ITabProps) => JSX.Element);
        icon?: string | JSX.Element;
        id: UniqueId;
        name?: string;
        renderPane?: ((item: P, tab?: ITabProps, group?: IEditorGroup) => React.ReactNode) | React.ReactNode;
        data?: T;
    }
    export const tabClassName: string;
    export const tabItemClassName: string;
    export const tabItemActiveClassName: string;
    export const tabItemLabelClassName: string;
    export const tabItemExtraClassName: string;
    /**
     * The type definition for The Tab Component
     */
    export type ITabComponent = {
        tab: ITabProps;
        active?: boolean;
    } & ITabEvent;
    export function Tab({ tab, active, ...restEvents }: ITabComponent): React.JSX.Element;
}
declare module "src/components/tabs/index" {
    import React from 'react';
    import { ITabProps } from "src/components/tabs/tab";
    import type { UniqueId } from "src/common/types";
    export type TabsType = 'line' | 'card';
    /**
     * TODO: Get rid of the ComponentProps in next version
     */
    export interface ITabsProps extends React.ComponentProps<any> {
        className?: string;
        style?: React.CSSProperties;
        role?: string;
        /**
         * @deprecated For now, we don't need to control the global closable
         */
        closable?: boolean;
        /**
         * @deprecated For now, we don't need to control the global editable
         */
        editable?: boolean;
        data?: ITabProps[];
        activeTab?: UniqueId;
        /**
         * Default is line
         */
        type?: TabsType;
        onCloseTab?: (key: UniqueId) => void;
        onContextMenu?: (e: React.MouseEvent, tab: ITabProps) => void;
        onMoveTab?: (tabs: ITabProps[]) => void;
        onSelectTab?: (key: UniqueId) => void;
    }
    export const tabsClassName: string;
    export const tabsHeader: string;
    export function Tabs(props: ITabsProps): React.JSX.Element;
}
declare module "src/components/display/index" {
    import React from 'react';
    export interface IDisplayProps extends React.ComponentProps<'div'> {
        visible?: boolean;
    }
    const Display: (props: IDisplayProps) => React.JSX.Element;
    export default Display;
}
declare module "src/components/index" {
    export { ActionBar } from "src/components/actionBar/index";
    export type { ActionBarItem, IActionBarProps, IActionBarItemProps, } from "src/components/actionBar/index";
    export { Breadcrumb } from "src/components/breadcrumb/index";
    export type { IBreadcrumbProps, IBreadcrumbItemProps } from "src/components/breadcrumb/index";
    export { Button } from "src/components/button/index";
    export type { IButtonProps } from "src/components/button/index";
    export { Checkbox } from "src/components/checkbox/index";
    export type { ICheckboxProps } from "src/components/checkbox/index";
    export { Collapse } from "src/components/collapse/index";
    export type { ICollapseProps } from "src/components/collapse/index";
    export { useContextMenu } from "src/components/contextMenu/index";
    export type { IContextMenuProps } from "src/components/contextMenu/index";
    export { useContextView, useContextViewEle } from "src/components/contextView/index";
    export type { IContextViewProps, IContextView } from "src/components/contextView/index";
    export { Modal } from "src/components/dialog/index";
    export type { IModalProps, IModalFuncProps } from "src/components/dialog/index";
    export { DropDown } from "src/components/dropdown/index";
    export type { IDropDownProps } from "src/components/dropdown/index";
    export { Icon } from "src/components/icon/index";
    export type { IIconProps } from "src/components/icon/index";
    export { Input } from "src/components/input/index";
    export type { IInputProps, ITextAreaProps } from "src/components/input/index";
    export { List, Item } from "src/components/list/index";
    export type { IListProps, IItemProps } from "src/components/list/index";
    export { Menu, MenuItem, SubMenu, MenuMode } from "src/components/menu/index";
    export type { IMenuProps, IMenuItemProps, ISubMenuProps } from "src/components/menu/index";
    export { MonacoEditor } from "src/components/monaco/index";
    export type { IMonacoEditorProps } from "src/components/monaco/index";
    export { ScrollBar as Scrollbar, DirectionKind } from "src/components/scrollBar/index";
    export type { IScrollEvent, IScrollbarProps, IScrollRef } from "src/components/scrollBar/index";
    export { Search } from "src/components/search/index";
    export type { ISearchProps } from "src/components/search/index";
    export { Select, Option } from "src/components/select/index";
    export type { ISelectProps, ISelectOptionProps } from "src/components/select/index";
    export { Tabs } from "src/components/tabs/index";
    export type { ITabsProps, TabsType } from "src/components/tabs/index";
    export { Tab } from "src/components/tabs/tab";
    export type { ITabProps } from "src/components/tabs/tab";
    export { Toolbar } from "src/components/toolbar/index";
    export type { IToolbarProps } from "src/components/toolbar/index";
    export { default as Tooltip } from "src/components/tooltip/index";
    export type { IToolTipProps } from "src/components/tooltip/index";
    export { default as TreeView } from "src/components/tree/index";
    export type { ITreeProps, ITreeNodeItemProps } from "src/components/tree/index";
    export { default as SplitPane } from "src/components/split/index";
    export * from "src/components/split/index";
    export { default as Display } from "src/components/display/index";
    export type { IDisplayProps } from "src/components/display/index";
}
declare module "src/monaco/api" {
    export { KeyChord } from 'monaco-editor/esm/vs/base/common/keyCodes';
    export type { IQuickInputService } from 'monaco-editor/esm/vs/platform/quickinput/common/quickInput';
    export { KeybindingWeight } from "src/monaco/common";
    export { Action2 } from "src/monaco/action";
}
declare module "src/controller/editor" {
    import 'reflect-metadata';
    import React from 'react';
    import { IEditorTab, IEditorActionsProps } from "src/model/workbench/editor";
    import { Controller } from "src/react/controller";
    import { IMenuItemProps } from "src/components/menu/index";
    import { IMonacoEditorProps } from "src/components/monaco/index";
    import { editor as MonacoEditor } from "src/monaco/index";
    import type { UniqueId } from "src/common/types";
    export interface IEditorController extends Partial<Controller> {
        open?<T = any>(tab: IEditorTab<T>, groupId?: UniqueId): void;
        onClickContextMenu?: (e: React.MouseEvent, item: IMenuItemProps, tabItem?: IEditorTab) => void;
        onCloseAll?: (group: UniqueId) => void;
        onCloseTab?: (tabId: UniqueId, group: UniqueId) => void;
        onCloseToLeft?: (tab: IEditorTab, group: UniqueId) => void;
        onCloseToRight?: (tab: IEditorTab, group: UniqueId) => void;
        onCloseOther?: (tab: IEditorTab, group: UniqueId) => void;
        onCloseSaved?: (group: UniqueId) => void;
        onChangeEditorProps?: (preProps: IMonacoEditorProps, nextProps: IMonacoEditorProps) => void;
        onMoveTab?: <T = any>(updateTabs: IEditorTab<T>[], group: UniqueId) => void;
        onSelectTab?: (tabId: UniqueId, group: UniqueId) => void;
        onClickActions: (action: IEditorActionsProps) => void;
        onUpdateEditorIns?: (editorInstance: any, groupId: UniqueId) => void;
        onPaneSizeChange?: (newSize: number[]) => void;
        initEditorEvents?: (editorInstance: MonacoEditor.IStandaloneCodeEditor, groupId: UniqueId) => void;
        getViewState?: (id: UniqueId) => MonacoEditor.ICodeEditorViewState;
    }
    export class EditorController extends Controller implements IEditorController {
        private editorStates;
        private readonly editorService;
        private readonly statusBarService;
        private readonly builtinService;
        private readonly layoutService;
        constructor();
        initView(): void;
        open<T>(tab: IEditorTab<any>, groupId?: UniqueId): void;
        onClickContextMenu: (e: React.MouseEvent, item: IMenuItemProps, tabItem?: IEditorTab<any>) => void;
        onCloseAll: (groupId: UniqueId) => void;
        onCloseTab: (tabId?: UniqueId, groupId?: UniqueId) => void;
        onCloseToRight: (tabItem: IEditorTab, groupId: UniqueId) => void;
        onCloseToLeft: (tabItem: IEditorTab, groupId: UniqueId) => void;
        onCloseOther: (tabItem: IEditorTab, groupId: UniqueId) => void;
        onMoveTab: (updateTabs: IEditorTab<any>[], groupId: UniqueId) => void;
        onSelectTab: (tabId: UniqueId, groupId: UniqueId) => void;
        /**
         * Called when open a new group
         */
        onUpdateEditorIns: (editorInstance: MonacoEditor.IStandaloneCodeEditor, groupId: UniqueId) => void;
        onClickActions: (action: IEditorActionsProps) => void;
        onPaneSizeChange: (newSize: number[]) => void;
        initEditorEvents(editorInstance: MonacoEditor.IStandaloneCodeEditor, groupId: UniqueId): void;
        getViewState: (id: UniqueId) => any;
        /**
         * Called when Editor props changed
         */
        onChangeEditorProps: (prevProps: IMonacoEditorProps, props: IMonacoEditorProps) => void;
        /**
         * Open a tab via instance.
         * Actually, one tab to one Model, so that
         * - the action to open a exist tab equals to switch the model in instance
         * - the action to open a new tab equals to create a new model in instance
         */
        private openTab;
        private updateStatusBar;
        updateEditorLineColumnInfo(editorInstance: MonacoEditor.IStandaloneCodeEditor): void;
        onEditorInstanceMount(editorInstance: MonacoEditor.IStandaloneCodeEditor): void;
    }
}
declare module "src/workbench/editor/base" {
    export const defaultEditorClassName: string;
    export const groupClassName: string;
    export const groupContainerClassName: string;
    export const groupHeaderClassName: string;
    export const groupTabsClassName: string;
    export const groupActionsClassName: string;
    export const groupActionsItemClassName: string;
    export const groupActionItemDisabledClassName: string;
    export const groupBreadcrumbClassName: string;
}
declare module "src/workbench/editor/action" {
    import React from 'react';
    import { IEditorAction } from "src/model/index";
    import { IEditorController } from "src/controller/editor";
    export interface IEditorActionProps extends IEditorAction {
        isActiveGroup: boolean;
    }
    function EditorAction(props: IEditorActionProps & IEditorController): React.JSX.Element;
    const _default_3: React.MemoExoticComponent<typeof EditorAction>;
    export default _default_3;
}
declare module "src/workbench/editor/breadcrumb" {
    import React from 'react';
    import { IBreadcrumbItemProps } from "src/components/breadcrumb/index";
    export interface IEditorBreadcrumbProps {
        breadcrumbs?: IBreadcrumbItemProps[];
    }
    function EditorBreadcrumb(props: IEditorBreadcrumbProps): React.JSX.Element;
    const _default_4: React.MemoExoticComponent<typeof EditorBreadcrumb>;
    export default _default_4;
}
declare module "src/workbench/editor/group" {
    import { IEditorGroup, IEditorOptions } from "src/model/index";
    import React from 'react';
    import { IEditorController } from "src/controller/editor";
    export interface IEditorGroupProps extends IEditorGroup {
        currentGroup?: IEditorGroup;
        editorOptions?: IEditorOptions;
        group?: IEditorGroup;
    }
    export function EditorGroup(props: IEditorGroupProps & IEditorController): React.JSX.Element;
    const _default_5: React.MemoExoticComponent<typeof EditorGroup>;
    export default _default_5;
}
declare module "src/workbench/editor/welcome/logo" {
    import React from 'react';
    export default function ({ className }: {
        className: any;
    }): React.JSX.Element;
}
declare module "src/services/keybinding" {
    import { ISimpleKeybinding } from "src/model/keybinding";
    export interface IKeybinding {
        _isMac: boolean;
        /**
         * Query global keybingding
         * @example
         * ```ts
         * const key = queryGlobalKeybinding('workbench.test');
         * // [{ctrlKey: boolean; shiftKey: false; altKey: false; metaKey: false; keyCode: 0;}]
         * ```
         */
        queryGlobalKeybinding: (id: string) => ISimpleKeybinding[] | null;
        /**
         * Convert simple keybinding to a string
         * @example
         * ```ts
         * const key = queryGlobalKeybinding('workbench.test');
         * // [{ctrlKey: boolean; shiftKey: false; altKey: false; metaKey: true; keyCode: 82;}]
         * convertSimpleKeybindingToString(key);
         * // ⌘,
         * ```
         */
        convertSimpleKeybindingToString: (keybinding?: ISimpleKeybinding[]) => string;
    }
    export const KeybindingHelper: IKeybinding;
}
declare module "src/workbench/editor/welcome/hooks" {
    export const useGetKeys: () => {
        keybindings: string;
        id: string;
        name: any;
    }[];
}
declare module "src/workbench/editor/welcome/index" {
    import React from 'react';
    export default function Welcome(): React.JSX.Element;
}
declare module "src/workbench/editor/editor" {
    import React from 'react';
    import { IEditor } from "src/model/index";
    import { IEditorController } from "src/controller/editor";
    import { ILayout } from "src/model/workbench/layout";
    export function Editor(props: {
        editor?: IEditor;
        layout?: ILayout;
    } & IEditorController): React.JSX.Element;
    const _default_6: React.MemoExoticComponent<typeof Editor>;
    export default _default_6;
}
declare module "src/workbench/editor/statusBarView/index" {
    import React from 'react';
    import { IStatusBarItem } from "src/model/workbench/statusBar";
    export function EditorStatusBarView(props: IStatusBarItem): React.JSX.Element;
    const _default_7: React.MemoExoticComponent<typeof EditorStatusBarView>;
    export default _default_7;
}
declare module "src/workbench/editor/index" {
    import 'reflect-metadata';
    import { Editor } from "src/workbench/editor/editor";
    import { EditorStatusBarView } from "src/workbench/editor/statusBarView/index";
    const EditorView: import("react").ComponentType<any>;
    export { Editor, EditorStatusBarView, EditorView };
}
declare module "src/workbench/sidebar/sidebar" {
    import React from 'react';
    import { ISidebar } from "src/model/workbench/sidebar";
    export interface IHeaderProps {
        title: React.ReactNode;
        toolbar: React.ReactNode;
    }
    export const Header: React.NamedExoticComponent<IHeaderProps>;
    export function Content(props: React.ComponentProps<any>): React.JSX.Element;
    export function Sidebar(props: ISidebar): React.JSX.Element;
}
declare module "src/controller/sidebar" {
    import 'reflect-metadata';
    import { Controller } from "src/react/controller";
    export interface ISideBarController extends Partial<Controller> {
    }
    export class SidebarController extends Controller implements ISideBarController {
        private readonly sidebarService;
        constructor();
        initView(): void;
        readonly onClick: (event: React.MouseEvent) => void;
    }
}
declare module "src/workbench/sidebar/index" {
    import 'reflect-metadata';
    export * from "src/workbench/sidebar/sidebar";
    export const SidebarView: import("react").ComponentType<any>;
}
declare module "src/monaco/quickToggleSideBarAction" {
    import 'reflect-metadata';
    import { ServicesAccessor } from 'monaco-editor/esm/vs/platform/instantiation/common/instantiation';
    import { Action2 } from "src/monaco/action";
    export class CommandQuickSideBarViewAction extends Action2 {
        static readonly ID = "sidebar";
        static readonly LABEL: any;
        private readonly layoutService;
        private readonly activityBarService;
        private readonly menuBarService;
        private readonly sideBarService;
        private _preActivityBar;
        constructor();
        run(accessor: ServicesAccessor, ...args: any[]): void;
    }
}
declare module "src/monaco/quickTogglePanelAction" {
    import 'reflect-metadata';
    import { ServicesAccessor } from 'monaco-editor/esm/vs/platform/instantiation/common/instantiation';
    import { Action2 } from "src/monaco/action";
    export class QuickTogglePanelAction extends Action2 {
        static readonly ID: string;
        static readonly LABEL: any;
        private readonly layoutService;
        private readonly menuBarService;
        constructor();
        run(accessor: ServicesAccessor): void;
    }
}
declare module "src/controller/menuBar" {
    import 'reflect-metadata';
    import { IActivityBarItem, IMenuBarItem } from "src/model/index";
    import { MenuBarMode } from "src/model/workbench/layout";
    import { Controller } from "src/react/controller";
    import type { UniqueId } from "src/common/types";
    export interface IMenuBarController extends Partial<Controller> {
        onSelect?: (key: UniqueId, item?: IActivityBarItem) => void;
        onClick: (event: React.MouseEvent<any, any>, item: IMenuBarItem) => void;
        updateFocusinEle?: (ele: HTMLElement | null) => void;
        updateStatusBar?: () => void;
        updateMenuBar?: () => void;
        updateActivityBar?: () => void;
        updateSideBar?: () => void;
        updateMenuBarMode?: (mode: keyof typeof MenuBarMode) => void;
        getMenuBarDataByMode?: (mode: keyof typeof MenuBarMode, menuData: IMenuBarItem[]) => IMenuBarItem[];
    }
    export class MenuBarController extends Controller implements IMenuBarController {
        private readonly menuBarService;
        private readonly layoutService;
        private readonly monacoService;
        private readonly builtinService;
        private readonly activityBarService;
        private _focusinEle;
        private _automation;
        constructor();
        initView(): void;
        updateFocusinEle: (ele: HTMLElement | null) => void;
        readonly onClick: (event: React.MouseEvent, item: IMenuBarItem) => void;
        createFile: () => void;
        undo: () => void;
        redo: () => void;
        gotoQuickCommand: () => void;
        updateActivityBar: () => void;
        selectAll: () => void;
        copyLineUp: () => void;
        updateMenuBar: () => void;
        updateMenuBarMode: (mode: keyof typeof MenuBarMode) => void;
        private updateMenuBarDataByMode;
        private getMenuBarItem;
        updateStatusBar: () => void;
        updateSideBar: () => void;
        updateAuxiliaryBar: () => void;
        private updatePanel;
        /**
         * Get the menu bar data after filtering out the menu contained in ids
         * @param menuData
         * @param ids
         * @returns Filtered menu bar data
         */
        private getFilteredMenuBarData;
        getMenuBarDataByMode(mode: keyof typeof MenuBarMode, menuData: IMenuBarItem[]): IMenuBarItem[];
        private updateActivityBarContextMenu;
    }
}
declare module "src/workbench/menuBar/logo" {
    import React from 'react';
    export default function Logo({ className }: {
        className: any;
    }): React.JSX.Element;
}
declare module "src/workbench/menuBar/horizontalView" {
    import React from 'react';
    import { IMenuBarItem } from "src/model/workbench/menuBar";
    import { IMenuProps } from "src/components/menu/index";
    export const defaultClassName: string;
    export const actionClassName: string;
    export const horizontalClassName: string;
    export const logoClassName: string;
    export const logoContentClassName: string;
    export interface IHorizontalViewProps {
        data?: IMenuProps[];
        onClick?: (event: React.MouseEvent<any, any>, item: IMenuBarItem) => void;
        logo?: React.ReactNode;
    }
    export function HorizontalView(props: IHorizontalViewProps): React.JSX.Element;
}
declare module "src/workbench/menuBar/menuBar" {
    import React from 'react';
    import { IMenuBar } from "src/model/workbench/menuBar";
    import { IMenuBarController } from "src/controller/menuBar";
    export const defaultClassName: string;
    export const actionClassName: string;
    export function MenuBar(props: IMenuBar & IMenuBarController): React.JSX.Element;
    export default MenuBar;
}
declare module "src/workbench/menuBar/index" {
    import 'reflect-metadata';
    import MenuBar from "src/workbench/menuBar/menuBar";
    const MenuBarView: import("react").ComponentType<any>;
    export { MenuBar, MenuBarView };
}
declare module "src/monaco/selectColorThemeAction" {
    import 'reflect-metadata';
    import { ServicesAccessor } from 'monaco-editor/esm/vs/platform/instantiation/common/instantiation';
    import { Action2 } from "src/monaco/action";
    export class SelectColorThemeAction extends Action2 {
        static readonly ID: string;
        static readonly LABEL: any;
        private readonly colorThemeService;
        constructor();
        run(accessor: ServicesAccessor): Promise<void>;
    }
}
declare module "src/monaco/quickAccessProvider" {
    /**
     * Register a quickAccessProvider, if it's exist, remove it first and register.
     * @param providerDescriptor
     */
    export function registerQuickAccessProvider(providerDescriptor: any): void;
    export function removeQuickAccessProvider(prefix: any): void;
}
declare module "src/monaco/quickAccessViewAction" {
    import 'reflect-metadata';
    import { DisposableStore } from 'monaco-editor/esm/vs/base/common/lifecycle';
    import { CancellationToken } from 'monaco-editor/esm/vs/base/common/cancellation';
    import { ICommandQuickPick } from 'monaco-editor/esm/vs/platform/quickinput/browser/commandsQuickAccess';
    import { AbstractEditorCommandsQuickAccessProvider } from 'monaco-editor/esm/vs/editor/contrib/quickAccess/commandsQuickAccess';
    import { ServicesAccessor } from 'monaco-editor/esm/vs/platform/instantiation/common/instantiation';
    import { editor as MonacoEditor } from "src/monaco/index";
    import { IEditorService } from "src/services/index";
    import { Action2 } from "src/monaco/action";
    export class CommandQuickAccessProvider extends AbstractEditorCommandsQuickAccessProvider {
        static PREFIX: string;
        protected readonly editorService: IEditorService | undefined;
        protected get activeTextEditorControl(): MonacoEditor.IStandaloneCodeEditor | undefined;
        protected static get services(): ServiceCollection;
        constructor();
        protected getCommandPicks(disposables: DisposableStore, token: CancellationToken): Promise<Array<ICommandQuickPick>>;
        protected getGlobalCommandPicks(disposables: DisposableStore): ICommandQuickPick[];
    }
    export class CommandQuickAccessViewAction extends Action2 {
        static ID: string;
        constructor();
        run(accessor: ServicesAccessor): void;
    }
}
declare module "src/controller/activityBar" {
    import 'reflect-metadata';
    import { Controller } from "src/react/controller";
    import { IMenuItemProps } from "src/components/menu/index";
    import { IActivityBarItem } from "src/model/index";
    import type { UniqueId } from "src/common/types";
    export interface IActivityBarController extends Partial<Controller> {
        /**
         * Called when activity bar item is clicked
         */
        onClick?: (selectedKey: UniqueId, selectedNode: IActivityBarItem) => void;
        /**
         * Called when activity bar item which is not global is changed
         */
        onChange?: (prevSelected?: UniqueId, nextSelected?: UniqueId) => void;
        onContextMenuClick?: (e: React.MouseEvent, item: IMenuItemProps | undefined) => void;
    }
    export class ActivityBarController extends Controller implements IActivityBarController {
        private readonly activityBarService;
        private readonly settingsService;
        private readonly monacoService;
        private readonly menuBarController;
        private readonly builtinService;
        constructor();
        initView(): void;
        readonly onClick: (selectedKey: UniqueId, selctedNode: IActivityBarItem) => void;
        readonly onChange: (prevSelected?: UniqueId, nextSelected?: UniqueId) => void;
        private gotoQuickCommand;
        private onSelectColorTheme;
        readonly onContextMenuClick: (e: React.MouseEvent, item: IMenuItemProps | undefined) => void;
    }
}
declare module "src/controller/auxiliaryBar" {
    import 'reflect-metadata';
    import { Controller } from "src/react/controller";
    import type { UniqueId } from "src/common/types";
    export interface IAuxiliaryController {
        onClick?: (key: UniqueId) => void;
    }
    export class AuxiliaryController extends Controller implements IAuxiliaryController {
        private readonly auxiliaryService;
        constructor();
        initView: () => void;
        onClick: (key: UniqueId) => void;
    }
}
declare module "src/workbench/notification/notificationPane/index" {
    import React from 'react';
    import { INotification } from "src/model/notification";
    import { INotificationController } from "src/controller/notification";
    export const defaultNotificationClassName: string;
    export function NotificationPane(props: INotification & Partial<INotificationController>): React.JSX.Element;
    const _default_8: React.MemoExoticComponent<typeof NotificationPane>;
    export default _default_8;
}
declare module "src/workbench/notification/statusBarView/index" {
    import React from 'react';
    import type { INotification } from "src/model/index";
    import type { INotificationController } from "src/controller/index";
    export function NotificationStatusBarView(props: INotification & Partial<INotificationController>): React.JSX.Element;
    const _default_9: React.MemoExoticComponent<typeof NotificationStatusBarView>;
    export default _default_9;
}
declare module "src/workbench/notification/index" {
    import NotificationPane from "src/workbench/notification/notificationPane/index";
    import NotificationStatusBarView from "src/workbench/notification/statusBarView/index";
    export { NotificationPane, NotificationStatusBarView };
}
declare module "src/controller/notification" {
    import 'reflect-metadata';
    import React from 'react';
    import { IStatusBarItem } from "src/model/index";
    import { Controller } from "src/react/controller";
    import { IActionBarItemProps } from "src/components/actionBar/index";
    import { INotificationItem } from "src/model/notification";
    export interface INotificationController extends Partial<Controller> {
        onCloseNotification(item: INotificationItem): void;
        onClick?: (e: React.MouseEvent, item: IStatusBarItem) => void;
        onActionBarClick?(event: React.MouseEvent<Element, MouseEvent>, item: IActionBarItemProps<any>): void;
        /**
         * Toggle the Notifications visibility
         */
        toggleNotifications(): void;
    }
    export class NotificationController extends Controller implements INotificationController {
        private readonly notificationService;
        private readonly statusBarService;
        private readonly builtinService;
        constructor();
        onCloseNotification: (item: INotificationItem<any>) => void;
        toggleNotifications(): void;
        onClick: (e: React.MouseEvent, item: IStatusBarItem) => void;
        onActionBarClick: (event: React.MouseEvent<Element, MouseEvent>, item: IActionBarItemProps<any>) => void;
        initView(): void;
    }
}
declare module "src/workbench/panel/output" {
    import React from 'react';
    import { IOutput } from "src/model/workbench/panel";
    function Output(props: IOutput): React.JSX.Element;
    export default Output;
}
declare module "src/controller/panel" {
    import 'reflect-metadata';
    import React from 'react';
    import { IActionBarItemProps } from "src/components/actionBar/index";
    import { Controller } from "src/react/controller";
    import type { UniqueId } from "src/common/types";
    export interface IPanelController extends Partial<Controller> {
        onTabChange?(key: UniqueId): void;
        onToolbarClick?(e: React.MouseEvent, item: IActionBarItemProps): void;
        onClose?(key: UniqueId): void;
    }
    export class PanelController extends Controller implements IPanelController {
        private readonly panelService;
        private readonly monacoService;
        private readonly builtinService;
        constructor();
        initView(): void;
        readonly onTabChange: (key: UniqueId) => void;
        readonly onClose: (key: UniqueId) => void;
        readonly onToolbarClick: (e: React.MouseEvent, item: IActionBarItemProps) => void;
    }
}
declare module "src/workbench/problems/statusBarView/index" {
    import React from 'react';
    import { IStatusBarItem } from "src/model/workbench/statusBar";
    export function ProblemsStatusBarView(props: IStatusBarItem): React.JSX.Element;
    const _default_10: React.MemoExoticComponent<typeof ProblemsStatusBarView>;
    export default _default_10;
}
declare module "src/workbench/problems/paneView/index" {
    import React from 'react';
    import { IProblems } from "src/model/index";
    function ProblemsPaneView(props: IProblems): React.JSX.Element;
    const _default_11: React.MemoExoticComponent<typeof ProblemsPaneView>;
    export default _default_11;
}
declare module "src/workbench/problems/index" {
    import ProblemsStatusBarView from "src/workbench/problems/statusBarView/index";
    import ProblemsPaneView from "src/workbench/problems/paneView/index";
    export { ProblemsStatusBarView, ProblemsPaneView };
}
declare module "src/controller/problems" {
    import 'reflect-metadata';
    import React from 'react';
    import { IStatusBarItem, IProblemsTreeNode } from "src/model/index";
    import { Controller } from "src/react/controller";
    export interface IProblemsController extends Partial<Controller> {
        onClick?: (e: React.MouseEvent, item: IStatusBarItem) => void;
        onSelect?: (node: IProblemsTreeNode) => void;
    }
    export class ProblemsController extends Controller implements IProblemsController {
        private readonly panelService;
        private readonly statusBarService;
        private readonly layoutService;
        private readonly monacoService;
        private readonly problemsService;
        private readonly builtinService;
        constructor();
        private showHideProblems;
        onClick: (e: React.MouseEvent, item: IStatusBarItem) => void;
        initView(): void;
        onSelect: (node: IProblemsTreeNode) => void;
    }
}
declare module "src/workbench/notification/notificationPane/localeNotification" {
    import React from 'react';
    interface ILocaleNotificationProps {
        locale: string;
    }
    export function LocaleNotification({ locale }: ILocaleNotificationProps): React.JSX.Element;
    const _default_12: React.MemoExoticComponent<typeof LocaleNotification>;
    export default _default_12;
}
declare module "src/controller/settings" {
    import 'reflect-metadata';
    import { Controller } from "src/react/controller";
    export interface ISettingsController extends Partial<Controller> {
    }
    export class SettingsController extends Controller implements ISettingsController {
        private readonly editorService;
        private readonly settingsService;
        private readonly localeService;
        private readonly notificationService;
        private readonly builtinService;
        constructor();
        /**
         * Delay the each Settings change event 600 milliseconds,
         * and then call the `update` and `emit` functions;
         */
        private onChangeSettings;
        initView(): void;
        private notifyLocaleChanged;
    }
}
declare module "src/controller/statusBar" {
    import 'reflect-metadata';
    import React from 'react';
    import { IStatusBarItem } from "src/model/index";
    import { Controller } from "src/react/controller";
    import { IMenuItemProps } from "src/components/menu/index";
    export interface IStatusBarController extends Partial<Controller> {
        onClick?: (e: React.MouseEvent, item: IStatusBarItem) => void;
        onContextMenuClick?: (e: React.MouseEvent, item: IMenuItemProps | undefined) => void;
    }
    export class StatusBarController extends Controller implements IStatusBarController {
        private readonly menuBarController;
        private readonly statusBarService;
        private readonly builtinService;
        constructor();
        initView(): void;
        onClick: (e: React.MouseEvent, item: IStatusBarItem) => void;
        readonly onContextMenuClick: (e: React.MouseEvent, item: IMenuItemProps | undefined) => void;
    }
}
declare module "src/controller/layout" {
    import 'reflect-metadata';
    import { Controller } from "src/react/controller";
    export interface ILayoutController extends Partial<Controller> {
        onWorkbenchDidMount?: () => void;
        onPaneSizeChange?: (splitPanePos: number[]) => void;
        onHorizontalPaneSizeChange?: (horizontalSplitPanePos: number[]) => void;
    }
    export class LayoutController extends Controller implements ILayoutController {
        private readonly layoutService;
        constructor();
        initView(): void;
        onPaneSizeChange: (splitPanePos: number[]) => void;
        onHorizontalPaneSizeChange: (horizontalSplitPanePos: number[]) => void;
        onWorkbenchDidMount: () => void;
    }
}
declare module "src/workbench/sidebar/explore/base" {
    const defaultExplorerClassName: string;
    const activityBarItemFloatClassName: string;
    const folderTreeClassName: string;
    const folderTreeInputClassName: string;
    const folderTreeEditClassName: string;
    const editorTreeClassName: string;
    const editorTreeItemClassName: string;
    const editorTreeGroupClassName: string;
    const editorTreeFileNameClassName: string;
    const editorTreeFilePathClassName: string;
    const editorTreeActiveItemClassName: string;
    const editorTreeCloseIconClassName: string;
    const editorTreeFileIconClassName: string;
    export { defaultExplorerClassName, activityBarItemFloatClassName, folderTreeClassName, folderTreeInputClassName, folderTreeEditClassName, editorTreeClassName, editorTreeItemClassName, editorTreeGroupClassName, editorTreeFileNameClassName, editorTreeFilePathClassName, editorTreeActiveItemClassName, editorTreeCloseIconClassName, editorTreeFileIconClassName, };
}
declare module "src/workbench/sidebar/explore/explore" {
    import React from 'react';
    import { IExplorer } from "src/model/workbench/explorer/explorer";
    import { IExplorerController } from "src/controller/explorer/explorer";
    type IExplorerProps = IExplorer & IExplorerController;
    export const Explorer: React.FunctionComponent<IExplorerProps>;
}
declare module "src/controller/explorer/folderTree" {
    import 'reflect-metadata';
    import { Controller } from "src/react/controller";
    import { IMenuItemProps } from "src/components/menu/index";
    import { FileType, IFolderTreeNodeProps } from "src/model/index";
    import type { UniqueId } from "src/common/types";
    export interface IFolderTreeController extends Partial<Controller> {
        readonly createTreeNode?: (type: FileType, id?: UniqueId) => void;
        readonly onClickContextMenu?: (contextMenu: IMenuItemProps, treeNode?: IFolderTreeNodeProps) => void;
        readonly onUpdateFileName?: (file: IFolderTreeNodeProps) => void;
        readonly onSelectFile?: (file?: IFolderTreeNodeProps) => void;
        readonly onDropTree?: (source: IFolderTreeNodeProps, target: IFolderTreeNodeProps) => void;
        readonly onLoadData?: (treeNode: IFolderTreeNodeProps) => Promise<void>;
        readonly onExpandKeys?: (expandKeys: UniqueId[]) => void;
        readonly onRightClick?: (treeNode: IFolderTreeNodeProps) => IMenuItemProps[];
    }
    export class FolderTreeController extends Controller implements IFolderTreeController {
        private readonly folderTreeService;
        private readonly builtinService;
        constructor();
        private getContextMenu;
        initView(): void;
        createTreeNode: (type: FileType, id?: UniqueId) => void;
        readonly onClickContextMenu: (contextMenu: IMenuItemProps, treeNode?: IFolderTreeNodeProps) => void;
        onRightClick: (treeNode: IFolderTreeNodeProps) => IMenuItemProps[];
        readonly onDropTree: (source: IFolderTreeNodeProps, target: IFolderTreeNodeProps) => void;
        onUpdateFileName: (file: IFolderTreeNodeProps) => void;
        readonly onSelectFile: (file?: IFolderTreeNodeProps) => void;
        private onContextMenuClick;
        private onRename;
        private onDelete;
        onLoadData: (treeNode: IFolderTreeNodeProps) => Promise<void>;
        onExpandKeys: (expandedKeys: UniqueId[]) => void;
    }
}
declare module "src/workbench/sidebar/explore/folderTree" {
    import 'reflect-metadata';
    import React from 'react';
    import { IFolderTree } from "src/model/index";
    import type { IFolderTreeController } from "src/controller/explorer/folderTree";
    import { ICollapseItem } from "src/components/collapse/index";
    export interface IFolderTreeProps extends IFolderTreeController, IFolderTree {
        panel: ICollapseItem;
    }
    const _default_13: React.NamedExoticComponent<IFolderTreeProps>;
    export default _default_13;
}
declare module "src/workbench/sidebar/explore/editorTree" {
    import React from 'react';
    import { IEditorTreeController } from "src/controller/index";
    import { IEditor, IEditorGroup } from "src/model/index";
    import { IActionBarItemProps, IMenuItemProps, ITabProps } from "src/components/index";
    import { ICollapseItem } from "src/components/collapse/index";
    import type { UniqueId } from "src/common/types";
    type UnionEditor = Omit<IEditor & IEditorTreeController, 'onContextMenu' | 'initView'>;
    export interface IOpenEditProps extends UnionEditor {
        /**
         * Group Header toolbar
         */
        groupToolbar?: IActionBarItemProps<IEditorGroup>[];
        /**
         * Item context menus
         */
        contextMenu?: IMenuItemProps[];
        /**
         * Group Header context menus
         * It'll use the value of contextMenu if specify contextMenu but not specify headerContextMenu
         */
        headerContextMenu?: IMenuItemProps[];
        onContextMenu?: (menu: IMenuItemProps, groupId: UniqueId, file?: ITabProps) => void;
        panel: ICollapseItem;
    }
    const EditorTree: (props: IOpenEditProps) => React.JSX.Element;
    export { EditorTree };
}
declare module "src/workbench/sidebar/explore/index" {
    import 'reflect-metadata';
    import { Explorer } from "src/workbench/sidebar/explore/explore";
    import FolderTree from "src/workbench/sidebar/explore/folderTree";
    import { EditorTree } from "src/workbench/sidebar/explore/editorTree";
    const FolderTreeView: import("react").ComponentType<any>;
    export { Explorer, FolderTreeView, FolderTree, EditorTree };
}
declare module "src/controller/explorer/explorer" {
    import 'reflect-metadata';
    import React from 'react';
    import { Controller } from "src/react/controller";
    import { IMenuItemProps } from "src/components/menu/index";
    import { IExplorerPanelItem } from "src/model/workbench/explorer/explorer";
    import { IActionBarItemProps } from "src/components/actionBar/index";
    export interface IExplorerController extends Partial<Controller> {
        onActionsContextMenuClick?: (e: React.MouseEvent, item?: IMenuItemProps) => void;
        onCollapseChange?: (keys: any) => void;
        onToolbarClick?: (item: IActionBarItemProps, panel: IExplorerPanelItem) => void;
        onClick?: (event: any, item: any) => void;
    }
    export class ExplorerController extends Controller implements IExplorerController {
        private readonly activityBarService;
        private readonly sidebarService;
        private readonly explorerService;
        private readonly folderTreeController;
        private readonly builtinService;
        constructor();
        initView(): void;
        readonly onClick: (event: React.MouseEvent, item: IActionBarItemProps) => void;
        readonly onActionsContextMenuClick: (e: React.MouseEvent, item?: IMenuItemProps) => void;
        readonly onCollapseChange: (keys: any) => void;
        readonly onToolbarClick: (item: IActionBarItemProps, parentPanel: IExplorerPanelItem) => void;
        renderFolderTree: (panel: any) => React.JSX.Element;
    }
}
declare module "src/controller/explorer/editorTree" {
    import 'reflect-metadata';
    import { Controller } from "src/react/controller";
    import { IActionBarItemProps, IMenuItemProps, ITabProps } from "src/components/index";
    import type { UniqueId } from "src/common/types";
    export interface IEditorTreeController extends Partial<Controller> {
        readonly onClose?: (tabId: UniqueId, groupId: UniqueId) => void;
        readonly onSelect?: (tabId: UniqueId, groupId: UniqueId) => void;
        readonly onCloseGroup?: (groupId: UniqueId) => void;
        readonly onSaveGroup?: (groupId: UniqueId) => void;
        readonly onToolbarClick?: (toolbar: IActionBarItemProps, groupId: UniqueId) => void;
        /**
         * Trigger by context menu click event
         * When click the context menu from group header, it doesn't have file info
         */
        readonly onContextMenu?: (menu: IMenuItemProps, groupId: UniqueId, file?: ITabProps) => void;
    }
    export class EditorTreeController extends Controller implements IEditorTreeController {
        private readonly explorerService;
        private readonly editService;
        private readonly builtinService;
        constructor();
        initView(): void;
        onContextMenu: (menu: IMenuItemProps, groupId: UniqueId, file?: ITabProps) => void;
        onClose: (tabId: UniqueId, groupId: UniqueId) => void;
        onSelect: (tabId: UniqueId, groupId: UniqueId) => void;
        onCloseGroup: (groupId: UniqueId) => void;
        onSaveGroup: (groupId: UniqueId) => void;
        onToolbarClick: (toolbar: IActionBarItemProps, groupId: UniqueId) => void;
    }
}
declare module "src/controller/explorer/outline" {
    import 'reflect-metadata';
    import { Controller } from "src/react/controller";
    import React from 'react';
    export interface IOutlineController extends Partial<Controller> {
    }
    export class OutlineController extends Controller implements IOutlineController {
        private readonly explorerService;
        private readonly builtinService;
        constructor();
        initView(): void;
        readonly onClick: (event: React.MouseEvent) => void;
    }
}
declare module "src/workbench/sidebar/search/base" {
    const emptyTextValueClassName: string;
    const matchSearchValueClassName: string;
    const deleteSearchValueClassName: string;
    const replaceSearchValueClassName: string;
    const treeContentClassName: string;
    export { matchSearchValueClassName, emptyTextValueClassName, deleteSearchValueClassName, replaceSearchValueClassName, treeContentClassName, };
}
declare module "src/workbench/sidebar/search/searchTree" {
    import React from 'react';
    import { ITreeProps } from "src/components/tree/index";
    export interface SearchTreeProps extends ITreeProps {
    }
    const _default_14: React.MemoExoticComponent<(props: SearchTreeProps) => React.JSX.Element>;
    export default _default_14;
}
declare module "src/workbench/sidebar/search/searchPanel" {
    import React from 'react';
    import { ISearchProps } from "src/model/workbench/search";
    import { ISearchController } from "src/controller/index";
    export interface ISearchPaneToolBar extends ISearchController, ISearchProps {
    }
    const SearchPanel: ({ value, replaceValue, searchAddons, replaceAddons, validationInfo, headerToolBar, result, toggleAddon, onResultClick, validateValue, setValidateInfo, onSearch, getSearchIndex, setSearchValue, setReplaceValue, onChange, toggleMode, }: ISearchPaneToolBar) => React.JSX.Element;
    export default SearchPanel;
}
declare module "src/workbench/sidebar/search/index" {
    import SearchPanel from "src/workbench/sidebar/search/searchPanel";
    export { SearchPanel };
}
declare module "src/controller/search/search" {
    import 'reflect-metadata';
    import { Controller } from "src/react/controller";
    import { IActionBarItemProps } from "src/components/actionBar/index";
    import { ISearchProps, ITreeNodeItemProps } from "src/components/index";
    export interface ISearchController extends Partial<Controller> {
        getSearchIndex?: (text: string, queryVal?: string) => number;
        setSearchValue?: (value?: string) => void;
        setReplaceValue?: (value?: string) => void;
        setValidateInfo?: (info: string | ISearchProps['validationInfo']) => void;
        toggleMode?: (status: boolean) => void;
        toggleAddon?: (addon?: IActionBarItemProps) => void;
        validateValue?: (value: string, callback: (err: void | Error) => void) => void;
        onResultClick?: (item: ITreeNodeItemProps, resultData: ITreeNodeItemProps[]) => void;
        onChange?: (value: string, replaceValue: string) => void;
        onSearch?: (value: string, replaceValue: string) => void;
    }
    export class SearchController extends Controller implements ISearchController {
        private readonly activityBarService;
        private readonly sidebarService;
        private readonly searchService;
        private readonly builtinService;
        constructor();
        initView(): void;
        validateValue: (value: string, callback: (err: void | Error) => void) => void;
        getSearchIndex: (text: string, queryVal?: string) => number;
        readonly setValidateInfo: (info: string | ISearchProps['validationInfo']) => void;
        readonly setSearchValue: (value?: string) => void;
        readonly setReplaceValue: (value?: string) => void;
        toggleAddon: (addon?: IActionBarItemProps) => void;
        readonly toggleMode: (status: boolean) => void;
        onChange: (value?: string, replaceValue?: string) => void;
        onSearch: (value?: string, replaceValue?: string) => void;
        onResultClick: (item: ITreeNodeItemProps, resultData: ITreeNodeItemProps[]) => void;
    }
}
declare module "src/monaco/quickAccessSettingsAction" {
    import 'reflect-metadata';
    import { ServicesAccessor } from 'monaco-editor/esm/vs/platform/instantiation/common/instantiation';
    import { Action2 } from "src/monaco/action";
    export class QuickAccessSettings extends Action2 {
        static readonly ID: string;
        static readonly LABEL: any;
        private readonly settingsService;
        constructor();
        run(accessor: ServicesAccessor): void;
    }
}
declare module "src/i18n/selectLocaleAction" {
    import 'reflect-metadata';
    import { ServicesAccessor } from 'monaco-editor/esm/vs/platform/instantiation/common/instantiation';
    import { Action2 } from "src/monaco/action";
    export class SelectLocaleAction extends Action2 {
        static readonly ID: string;
        static readonly LABEL: any;
        private get localeService();
        constructor();
        run(accessor: ServicesAccessor): Promise<void>;
    }
}
declare module "src/monaco/quickSelectAllAction" {
    import 'reflect-metadata';
    import { Action2 } from "src/monaco/action";
    export class QuickSelectAllAction extends Action2 {
        static readonly ID: string;
        static readonly DESC = "Select All";
        static readonly LABEL: any;
        private readonly editorService;
        constructor();
        selectEditorAll(): void;
        isTextdom(ele: Element): ele is HTMLInputElement;
        run(accessor: any, ...args: any[]): void;
    }
}
declare module "src/monaco/quickCopyLineUp" {
    import 'reflect-metadata';
    import { Action2 } from "src/monaco/action";
    export class QuickCopyLineUp extends Action2 {
        static readonly ID: string;
        static readonly LABEL: any;
        static readonly DESC = "Copy Line Up";
        private readonly editorService;
        constructor();
        run(): void;
    }
}
declare module "src/monaco/quickUndo" {
    import 'reflect-metadata';
    import { Action2 } from "src/monaco/action";
    export class QuickUndo extends Action2 {
        static readonly ID: string;
        static readonly LABEL: any;
        static readonly DESC = "Undo";
        private readonly editorService;
        constructor();
        isTextdom(ele: Element): ele is HTMLInputElement;
        run(accessor: any, ...args: any[]): void;
    }
}
declare module "src/monaco/quickRedo" {
    import 'reflect-metadata';
    import { Action2 } from "src/monaco/action";
    export class QuickRedo extends Action2 {
        static readonly ID: string;
        static readonly LABEL: any;
        static readonly DESC = "Redo";
        private readonly editorService;
        constructor();
        isTextdom(ele: Element): ele is HTMLInputElement;
        run(accessor: any, ...args: any[]): void;
    }
}
declare module "src/monaco/quickCreateFile" {
    import 'reflect-metadata';
    import { Action2 } from "src/monaco/action";
    export class QuickCreateFile extends Action2 {
        static readonly ID: string;
        static readonly LABEL: any;
        static readonly DESC = "New File";
        private readonly folderTreeController;
        constructor();
        run(): void;
    }
}
declare module "src/controller/extension" {
    import 'reflect-metadata';
    import { Controller } from "src/react/controller";
    export interface IExtensionController extends Partial<Controller> {
    }
    export class ExtensionController extends Controller implements IExtensionController {
        private readonly extensionService;
        private readonly builtinService;
        constructor();
        initView(): void;
    }
}
declare module "src/controller/index" {
    export * from "src/controller/activityBar";
    export * from "src/controller/auxiliaryBar";
    export * from "src/controller/editor";
    export * from "src/controller/menuBar";
    export * from "src/controller/notification";
    export * from "src/controller/panel";
    export * from "src/controller/problems";
    export * from "src/controller/settings";
    export * from "src/controller/sidebar";
    export * from "src/controller/statusBar";
    export * from "src/controller/layout";
    export * from "src/controller/explorer/explorer";
    export * from "src/controller/explorer/folderTree";
    export * from "src/controller/explorer/editorTree";
    export * from "src/controller/explorer/outline";
    export * from "src/controller/search/search";
    export * from "src/controller/extension";
}
declare module "src/workbench/activityBar/base" {
    export const defaultClassName: string;
    export const containerClassName: string;
    export const normalItemsClassName: string;
    export const globalItemsClassName: string;
    export const itemClassName: string;
    export const itemCheckedClassName: string;
    export const itemDisabledClassName: string;
    export const labelClassName: string;
    export const indicatorClassName: string;
}
declare module "src/workbench/activityBar/activityBarItem" {
    import React from 'react';
    import { IActivityBarItem } from "src/model/workbench/activityBar";
    import { IActivityBarController } from "src/controller/activityBar";
    export function ActivityBarItem(props: IActivityBarItem & IActivityBarController): React.JSX.Element;
}
declare module "src/workbench/activityBar/activityBar" {
    import React from 'react';
    import { IActivityBar } from "src/model/workbench/activityBar";
    import { IActivityBarController } from "src/controller/activityBar";
    export function ActivityBar(props: IActivityBar & IActivityBarController): React.JSX.Element;
    export default ActivityBar;
}
declare module "src/workbench/activityBar/index" {
    import 'reflect-metadata';
    export * from "src/workbench/activityBar/activityBar";
    export { ActivityBarItem } from "src/workbench/activityBar/activityBarItem";
    export const ActivityBarView: import("react").ComponentType<any>;
}
declare module "src/workbench/statusBar/base" {
    import { IStatusBarItem } from "src/model/index";
    export const statusBarClassName: string;
    export const leftItemsClassName: string;
    export const rightItemsClassName: string;
    export const itemClassName: string;
    export function sortByIndex(a: IStatusBarItem, b: IStatusBarItem): number;
}
declare module "src/workbench/statusBar/item" {
    import React from 'react';
    import { IStatusBarItem } from "src/model/workbench/statusBar";
    import { IStatusBarController } from "src/controller/statusBar";
    export function StatusItem(props: IStatusBarItem & IStatusBarController): React.JSX.Element;
}
declare module "src/workbench/statusBar/statusBar" {
    import React from 'react';
    import { IStatusBar } from "src/model/workbench/statusBar";
    import { IStatusBarController } from "src/controller/statusBar";
    export function StatusBar(props: IStatusBar & IStatusBarController): React.JSX.Element;
}
declare module "src/workbench/statusBar/index" {
    import 'reflect-metadata';
    export * from "src/workbench/statusBar/statusBar";
    export * from "src/workbench/statusBar/item";
    export const StatusBarView: import("react").ComponentType<any>;
}
declare module "src/workbench/panel/panel" {
    import React from 'react';
    import { IPanel } from "src/model/workbench/panel";
    import { IPanelController } from "src/controller/panel";
    export function Panel(props: IPanel & IPanelController): React.JSX.Element;
    export default Panel;
}
declare module "src/workbench/panel/index" {
    import 'reflect-metadata';
    const PanelView: import("react").ComponentType<any>;
    export { PanelView };
}
declare module "src/workbench/auxiliaryBar/base" {
    export const defaultClassName: string;
    export const containerClassName: string;
    export const tabsClassName: string;
    export const tabClassName: string;
    export const tabActiveClassName: string;
}
declare module "src/workbench/auxiliaryBar/auxiliaryBar" {
    import React from 'react';
    import type { IAuxiliaryBar } from "src/model/index";
    export default function AuxiliaryBar({ children }: IAuxiliaryBar): React.JSX.Element;
}
declare module "src/workbench/auxiliaryBar/auxiliaryBarTab" {
    import React from 'react';
    import type { IAuxiliaryBar } from "src/model/index";
    import type { IAuxiliaryController } from "src/controller/index";
    export default function AuxiliaryBarTab({ mode, data, current, onClick, }: IAuxiliaryBar & IAuxiliaryController): React.JSX.Element;
}
declare module "src/workbench/auxiliaryBar/index" {
    import 'reflect-metadata';
    const AuxiliaryBar: import("react").ComponentType<any>;
    const AuxiliaryBarTab: import("react").ComponentType<any>;
    export { AuxiliaryBar, AuxiliaryBarTab };
}
declare module "src/workbench/workbench" {
    import 'reflect-metadata';
    import React from 'react';
    import { ILayoutController } from "src/controller/layout";
    import { ILayout } from "src/model/workbench/layout";
    import { IWorkbench } from "src/model/index";
    export function WorkbenchView(props: IWorkbench & ILayout & ILayoutController): React.JSX.Element;
    export const Workbench: React.ComponentType<any>;
}
declare module "src/workbench/index" {
    export { WorkbenchView as Workbench } from "src/workbench/workbench";
    export { ActivityBar } from "src/workbench/activityBar/index";
    export { ActivityBarItem } from "src/workbench/activityBar/activityBarItem";
    export { Editor } from "src/workbench/editor/editor";
    export { EditorGroup } from "src/workbench/editor/group";
    export { MenuBar } from "src/workbench/menuBar/menuBar";
    export { Panel } from "src/workbench/panel/panel";
    export { Sidebar } from "src/workbench/sidebar/index";
    export { StatusBar, StatusItem } from "src/workbench/statusBar/index";
    export type { IWorkbench, IActivityBar, IActivityBarItem, IEditor, IEditorGroup, IMenuBar, IPanel, ISidebar, IStatusBar, IStatusBarItem, IProblems, IProblemsItem, INotification, INotificationItem, } from "src/model/index";
    export type { IActivityBarController, ILayoutController, IEditorController, ISideBarController, IMenuBarController, ISettingsController, INotificationController, IPanelController, IProblemsController, IStatusBarController, } from "src/controller/index";
}
declare module "src/molecule.api" {
    import 'reflect-metadata';
    export * as event from "src/common/event/index";
    export * as react from "src/react/index";
    export * as component from "src/components/index";
    export * as monaco from "src/monaco/api";
    export * from "src/i18n/index";
    export * from "src/workbench/index";
    export * from "src/services/index";
    export * as model from "src/model/index";
    import { ILayoutService, IActivityBarService, IExplorerService, IFolderTreeService, ISearchService, ISidebarService, IMenuBarService, IStatusBarService, IEditorService, IPanelService, INotificationService, IColorThemeService, ISettingsService, IProblemsService, IEditorTreeService, BuiltinService, IExtensionService, IAuxiliaryBarService } from "src/services/index";
    import { ILocaleService } from "src/i18n/index";
    import { IMonacoService } from "src/monaco/monacoService";
    /**
     * The locale service
     */
    export const i18n: ILocaleService;
    /**
     * The layout service
     */
    export const layout: ILayoutService;
    /**
     * The activityBar service
     */
    export const activityBar: IActivityBarService;
    export const auxiliaryBar: IAuxiliaryBarService;
    export const explorer: IExplorerService;
    export const folderTree: IFolderTreeService;
    export const editorTree: IEditorTreeService;
    export const search: ISearchService;
    export const sidebar: ISidebarService;
    export const menuBar: IMenuBarService;
    export const editor: IEditorService;
    export const statusBar: IStatusBarService;
    export const panel: IPanelService;
    export const notification: INotificationService;
    export const problems: IProblemsService;
    /**
     * The ColorTheme service
     */
    export const colorTheme: IColorThemeService;
    /**
     * The Settings service
     */
    export const settings: ISettingsService;
    export const builtin: BuiltinService;
    /**
     * The Extension service
     */
    export const extension: IExtensionService;
    export const monacoService: IMonacoService;
}
declare module "src/extensions/folderTree/index" {
    import { IExtension } from "src/model/extension";
    export const ExtendsFolderTree: IExtension;
}
declare module "src/extensions/activityBar/index" {
    import { IExtension } from "src/model/extension";
    export const ExtendsActivityBar: IExtension;
}
declare module "src/extensions/panel/index" {
    import { IExtension } from "src/model/extension";
    export const ExtendsPanel: IExtension;
}
declare module "src/extensions/explorer/index" {
    import { IExtension } from "src/model/extension";
    export const ExtendsExplorer: IExtension;
}
declare module "src/extensions/editorTree/index" {
    import { IExtension } from "src/model/extension";
    export const ExtendsEditorTree: IExtension;
}
declare module "src/extensions/theme-defaults/index" {
    import { IExtension } from "src/model/extension";
    const defaultColorThemeExtension: IExtension;
    export { defaultColorThemeExtension };
}
declare module "src/extensions/theme-monokai/index" {
    import { IExtension } from "src/model/extension";
    const monokaiColorThemeExtension: IExtension;
    export { monokaiColorThemeExtension };
}
declare module "src/extensions/vscode-palenight-theme/index" {
    import { IExtension } from "src/model/extension";
    const paleNightColorThemeExtension: IExtension;
    export { paleNightColorThemeExtension };
}
declare module "src/extensions/vscode-intellij-darcula-theme-master/index" {
    import { IExtension } from "src/model/extension";
    const webStormIntelliJExtension: IExtension;
    export { webStormIntelliJExtension };
}
declare module "src/extensions/github-plus-theme-master/index" {
    import { IExtension } from "src/model/extension";
    const githubPlusExtension: IExtension;
    export { githubPlusExtension };
}
declare module "src/extensions/editor/index" {
    import { IExtension } from "src/model/extension";
    export const ExtendsEditor: IExtension;
}
declare module "src/extensions/index" {
    /**
     * Default extensions
     */
    export const defaultExtensions: import("mo/model").IExtension[];
}
declare module "src/services/instanceService" {
    import { ReactElement } from 'react';
    import { GlobalEvent } from "src/common/event/index";
    import { IConfigProps } from "src/provider/create";
    interface IInstanceServiceProps {
        getConfig: () => IConfigProps;
        render: (dom: ReactElement) => ReactElement;
        onBeforeInit: (callback: () => void) => void;
        onBeforeLoad: (callback: () => void) => void;
    }
    export default class InstanceService extends GlobalEvent implements IInstanceServiceProps {
        private _config;
        private rendered;
        constructor(config: IConfigProps);
        private initialLocaleService;
        getConfig: () => IConfigProps;
        render: (workbench: ReactElement) => ReactElement<any, string | import("react").JSXElementConstructor<any>>;
        onBeforeInit: (callback: () => void) => void;
        onBeforeLoad: (callback: () => void) => void;
    }
}
declare module "src/provider/create" {
    import { IExtension } from "src/model/index";
    import InstanceService from "src/services/instanceService";
    export interface IConfigProps {
        /**
         * Molecule Extension instances, after the MoleculeProvider
         * did mount, then handle it.
         */
        extensions?: IExtension[];
        /**
         * Specify a default locale Id, the Molecule built-in `zh-CN`, `en` two languages, and
         * default locale Id is `en`.
         */
        defaultLocale?: string;
    }
    export default function create(config: IConfigProps): InstanceService;
    /**
     * Do NOT call it in production, ONLY used for test cases
     */
    export function clearInstance(): void;
}
declare module "src/provider/molecule" {
    import React from 'react';
    import { IConfigProps } from "src/provider/create";
    export default function Provider({ defaultLocale, extensions, children, }: IConfigProps & {
        children: React.ReactElement;
    }): React.ReactElement<any, string | React.JSXElementConstructor<any>>;
}
declare module "src/provider/index" {
    export * from "src/provider/molecule";
    export { default as create } from "src/provider/create";
}
declare module "src/index" {
    import * as molecule from "src/molecule.api";
    export { Workbench } from "src/workbench/workbench";
    export { create } from "src/provider/index";
    export { molecule };
    export default molecule;
}
declare module "mo" {
    import React from 'react';
    import ReactDOM from 'react-dom';
    import { HTML5Backend } from 'react-dnd-html5-backend';
    import { DndProvider, useDrag, useDrop } from 'react-dnd';
    import { molecule, create, Workbench } from "src/index";
    import { Header, Content } from "src/workbench/sidebar/index";
    import { select, getEventPosition } from 'src/common/dom';
    import { Action2 } from "src/monaco/action";
    import * as leva from 'leva';
    import * as leva_plugin from 'leva/plugin';
    import * as echarts from 'echarts';
    import GridLayout, { Responsive, WidthProvider } from "react-grid-layout";
    import eruda from 'eruda';
    export { React, ReactDOM };
    export { HTML5Backend };
    export { DndProvider, useDrag, useDrop };
    export { molecule, create, Workbench };
    export { Header, Content };
    export { select, getEventPosition };
    export { leva, leva_plugin };
    export { echarts };
    export { GridLayout, Responsive, WidthProvider };
    export { eruda };
    export class SaveAction extends Action2 {
        static readonly ID = "Save";
        constructor();
        run(accessor: any, ...args: any[]): void;
    }
}
declare module "src/common/observable" {
    export interface IObservable {
        /**
         * The onChange of observed object
         */
        subscribe: (onChange: (target: any, property: any, value: any) => void) => void;
    }
    /**
     * Wrap an object to an observable object
     * @param object target object
     * @param callback callback when target observed
     */
    export function observableWrapper<T = any>(object: any, callback?: any): IObservable & T;
    /**
     * Observable decorator
     * @param target observable target object
     * @param name
     * @param descriptor
     */
    export function observable(): any;
}
declare module "src/model/ui" {
    import { IColorTheme } from "src/model/colorTheme";
    import { IIconTheme } from "src/model/iconTheme";
    export interface IUI {
        colorTheme?: IColorTheme;
        iconTheme?: IIconTheme;
    }
}
declare module "src/services/baseService" {
    export abstract class BaseService<S = any> {
    }
}
declare module "src/workbench/editor/welcome/name" {
    import React from 'react';
    export default function (): React.JSX.Element;
}
declare module "src/workbench/settings/settings" {
    import React from 'react';
    export function Settings(): React.JSX.Element;
    const _default_15: React.MemoExoticComponent<typeof Settings>;
    export default _default_15;
}
declare module "src/workbench/settings/index" {
    export * from "src/workbench/settings/settings";
}
