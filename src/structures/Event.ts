import type { ClientEvents } from "discord.js";
import type Lavamusic from "./Lavamusic";
import type { LavalinkManagerEvents, NodeManagerEvents } from "lavalink-client";

export type AllEvents = LavalinkManagerEvents & NodeManagerEvents & ClientEvents;

interface EventOptions {
    name: keyof AllEvents;
    one?: boolean;
}

export default class Event {
    public client: Lavamusic;
    public one: boolean;
    public file: string;
    public name: keyof AllEvents;
    public fileName: string;

    constructor(client: Lavamusic, file: string, options: EventOptions) {
        this.client = client;
        this.file = file;
        this.name = options.name;
        this.one = options.one ?? false;
        this.fileName = file.split(".")[0];
    }

    public async run(..._args: any): Promise<void> {
        return await Promise.resolve();
    }
}

/**
 * Project: lavamusic
 * Author: Appu
 * Main Contributor: LucasB25
 * Company: Coders
 * Copyright (c) 2024. All rights reserved.
 * This code is the property of Coder and may not be reproduced or
 * modified without permission. For more information, contact us at
 * https://discord.gg/ns8CTk9J3e
 */
