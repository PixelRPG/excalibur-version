import type { FadeScreenEvent } from '../events';
import type { ActorEvents } from 'excalibur/build/dist/Actor';

export type PrpgScreenEvents = {
complete: FadeScreenEvent;
} & ActorEvents;