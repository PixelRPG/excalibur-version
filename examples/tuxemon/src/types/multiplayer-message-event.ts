import type { MultiplayerEventType, MultiplayerMessageInfo } from './index'

export interface MultiplayerMessageEvent<I = any> {
    type: MultiplayerEventType.MESSAGE;
    info: MultiplayerMessageInfo<I>;
}