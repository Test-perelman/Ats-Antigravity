"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TeamPrismaService = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const prisma_service_1 = require("./prisma.service");
let TeamPrismaService = class TeamPrismaService {
    request;
    prisma;
    _extendedClient;
    constructor(request, prisma) {
        this.request = request;
        this.prisma = prisma;
    }
    get client() {
        if (this._extendedClient) {
            return this._extendedClient;
        }
        const teamId = this.request.member?.teamId;
        console.log(`[TeamPrismaService] Request Member: ${JSON.stringify(this.request.member)}, User: ${this.request.user?.email}`);
        const isMasterAdmin = this.request.user?.systemRole === 'master_admin';
        if (isMasterAdmin && !teamId) {
            return this.prisma;
        }
        if (!teamId) {
        }
        this._extendedClient = this.prisma.$extends({
            query: {
                $allModels: {
                    async $allOperations({ model, operation, args, query }) {
                        const globalTables = ['User', 'Team', 'TeamMembership', 'Role', 'Permission', 'RolePermission', 'AuditLog', 'TeamAccessRequest', 'TeamSettings'];
                        if (globalTables.includes(model)) {
                            return query(args);
                        }
                        if (!teamId) {
                            throw new common_1.UnauthorizedException(`Operation on ${model} requires Team Context`);
                        }
                        if (operation === 'create' || operation === 'createMany') {
                            if (args.data) {
                                if (Array.isArray(args.data)) {
                                    args.data.forEach((d) => d.teamId = teamId);
                                }
                                else {
                                    args.data.teamId = teamId;
                                }
                            }
                        }
                        else {
                            if (!args.where) {
                                args.where = {};
                            }
                            args.where.teamId = teamId;
                        }
                        return query(args);
                    },
                },
            },
        });
        return this._extendedClient;
    }
};
exports.TeamPrismaService = TeamPrismaService;
exports.TeamPrismaService = TeamPrismaService = __decorate([
    (0, common_1.Injectable)({ scope: common_1.Scope.REQUEST }),
    __param(0, (0, common_1.Inject)(core_1.REQUEST)),
    __metadata("design:paramtypes", [Object, prisma_service_1.PrismaService])
], TeamPrismaService);
//# sourceMappingURL=team-prisma.service.js.map