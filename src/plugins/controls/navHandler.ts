import { get } from 'lodash-es';
import { Network } from 'vis-network';

export interface NavHandler {
  bindToRedraw: (functionName: string) => void;
  unbindFromRedraw: (functionName: string) => void;
}

const navHandler = (network?: Network): NavHandler | undefined =>
  get(network, 'interactionHandler.navigationHandler') as
    | NavHandler
    | undefined;

export default navHandler;
