import { createSelector } from "reselect";
import { AppState } from "@appsmith/reducers";
import { FlattenedWidgetProps } from "reducers/entityReducers/canvasWidgetsReducer";
import { getExistingWidgetNames } from "sagas/selectors";
import { getNextEntityName } from "utils/AppsmithUtils";

import WidgetFactory from "utils/WidgetFactory";
import { getParentToOpenIfAny } from "utils/hooks/useClickToSelectWidget";

export const getIsDraggingOrResizing = (state: AppState) =>
  state.ui.widgetDragResize.isResizing || state.ui.widgetDragResize.isDragging;

export const getIsResizing = (state: AppState) =>
  state.ui.widgetDragResize.isResizing;

const getCanvasWidgets = (state: AppState) => state.entities.canvasWidgets;
export const getModalDropdownList = createSelector(
  getCanvasWidgets,
  (widgets) => {
    const modalWidgets = Object.values(widgets).filter(
      (widget: FlattenedWidgetProps) => widget.type === "MODAL_WIDGET",
    );
    if (modalWidgets.length === 0) return undefined;

    return modalWidgets.map((widget: FlattenedWidgetProps) => ({
      id: widget.widgetId,
      label: widget.widgetName,
      value: `${widget.widgetName}`,
    }));
  },
);

export const getNextModalName = createSelector(
  getExistingWidgetNames,
  (names) => {
    const prefix =
      WidgetFactory.widgetConfigMap.get("MODAL_WIDGET")?.widgetName || "";
    return getNextEntityName(prefix, names);
  },
);

/**
 * Selector to get the parent widget of a particaular widget with id as a prop
 */
export const getParentWidget = createSelector(
  getCanvasWidgets,
  (state: AppState, widgetId: string) => widgetId,
  (canvasWidgets, widgetId: string): FlattenedWidgetProps | undefined => {
    if (canvasWidgets.hasOwnProperty(widgetId)) {
      const widget = canvasWidgets[widgetId];
      if (widget.parentId && canvasWidgets.hasOwnProperty(widget.parentId)) {
        const parent = canvasWidgets[widget.parentId];
        return parent;
      }
    }
    return;
  },
);

export const getFocusedParentToOpen = createSelector(
  getCanvasWidgets,
  (state: AppState) => state.ui.widgetDragResize.focusedWidget,
  (canvasWidgets, focusedWidgetId) => {
    return getParentToOpenIfAny(focusedWidgetId, canvasWidgets);
  },
);

export const getParentToOpenSelector = (widgetId: string) => {
  return createSelector(getCanvasWidgets, (canvasWidgets) => {
    return getParentToOpenIfAny(widgetId, canvasWidgets);
  });
};
