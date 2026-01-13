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
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TeamGuard = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
let TeamGuard = class TeamGuard {
    reflector;
    constructor(reflector) {
        this.reflector = reflector;
    }
    canActivate(context) {
        const isPublic = this.reflector.getAllAndOverride('isPublic', [
            context.getHandler(),
            context.getClass(),
        ]);
        if (isPublic) {
            return true;
        }
        const request = context.switchToHttp().getRequest();
        const user = request.user;
        const teamId = request.headers['x-team-id'];
        if (!teamId) {
            if (!user) {
                return false;
            }
        }
        if (!user || !user.roles) {
            return false;
        }
        console.log(`[TeamGuard] TeamID: ${teamId}, UserRoles: ${JSON.stringify(user?.roles?.map(r => ({ t: r.teamId, r: r.role })))}`);
        const membership = user.roles.find((m) => m.teamId === teamId);
        if (!membership) {
            if (user.systemRole === 'master_admin') {
                return true;
            }
            throw new common_1.ForbiddenException('You do not have access to this team');
        }
        request.member = membership;
        return true;
    }
};
exports.TeamGuard = TeamGuard;
exports.TeamGuard = TeamGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof core_1.Reflector !== "undefined" && core_1.Reflector) === "function" ? _a : Object])
], TeamGuard);
//# sourceMappingURL=team.guard.js.map