import { ObjectId } from 'base/types';
import { Position2D } from 'utils/overlay/controller';

export type ContextEventTargetType = 'node' | 'edge' | 'canvas';

export interface Pointer {
  dom: Position2D;
  canvas: Position2D;
}

interface ContextEventTargetNoData<Type extends ContextEventTargetType> {
  type: Type;

  pointer: Pointer;
}

interface ContextEventTargetWithData<
  Type extends ContextEventTargetType,
  DataType,
> extends ContextEventTargetNoData<Type> {
  data: DataType;
}

export type ContextEventTarget =
  | ContextEventTargetNoData<'canvas'>
  | ContextEventTargetWithData<'node', ObjectId>
  | ContextEventTargetWithData<'edge', ObjectId>;

export interface ContextEvent {
  target: ContextEventTarget;
}

export type CertainContextEventTarget<
  TargetType extends ContextEventTargetType,
> = ContextEventTarget & ContextEventTargetNoData<TargetType>;

export type CertainContextEvent<TargetType extends ContextEventTargetType> =
  ContextEvent & {
    target: CertainContextEventTarget<TargetType>;
  };
