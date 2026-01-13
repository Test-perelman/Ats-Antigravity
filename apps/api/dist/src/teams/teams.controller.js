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
exports.TeamsController = void 0;
const common_1 = require("@nestjs/common");
const teams_service_1 = require("./teams.service");
const create_team_dto_1 = require("./dto/create-team.dto");
const passport_1 = require("@nestjs/passport");
let TeamsController = class TeamsController {
    teamsService;
    constructor(teamsService) {
        this.teamsService = teamsService;
    }
    create(createTeamDto, req) {
        if (req.user.systemRole !== 'master_admin') {
            throw new Error('Only Master Admin can create teams');
        }
        return this.teamsService.create(createTeamDto, req.user.id);
    }
    findAll() {
        return this.teamsService.findAll();
    }
    findMyTeams(req) {
        return this.teamsService.findMyTeams(req.user.id);
    }
    join(id, req) {
        return this.teamsService.requestAccess(req.user.id, id);
    }
    getRequests(id) {
        return this.teamsService.getRequests(id);
    }
    approveRequest(id, requestId) {
        return this.teamsService.approveAccess(requestId, id);
    }
    rejectRequest(requestId) {
        return this.teamsService.rejectAccess(requestId);
    }
    findOne(id) {
        return this.teamsService.findOne(id);
    }
};
exports.TeamsController = TeamsController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_team_dto_1.CreateTeamDto, Object]),
    __metadata("design:returntype", void 0)
], TeamsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], TeamsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('my'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], TeamsController.prototype, "findMyTeams", null);
__decorate([
    (0, common_1.Post)(':id/join'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], TeamsController.prototype, "join", null);
__decorate([
    (0, common_1.Get)(':id/requests'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], TeamsController.prototype, "getRequests", null);
__decorate([
    (0, common_1.Post)(':id/requests/:requestId/approve'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Param)('requestId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], TeamsController.prototype, "approveRequest", null);
__decorate([
    (0, common_1.Post)(':id/requests/:requestId/reject'),
    __param(0, (0, common_1.Param)('requestId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], TeamsController.prototype, "rejectRequest", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], TeamsController.prototype, "findOne", null);
exports.TeamsController = TeamsController = __decorate([
    (0, common_1.Controller)('teams'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    __metadata("design:paramtypes", [teams_service_1.TeamsService])
], TeamsController);
//# sourceMappingURL=teams.controller.js.map