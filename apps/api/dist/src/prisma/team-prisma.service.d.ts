import { PrismaService } from './prisma.service';
export declare class TeamPrismaService {
    private request;
    private prisma;
    private _extendedClient;
    constructor(request: any, prisma: PrismaService);
    get client(): any;
}
