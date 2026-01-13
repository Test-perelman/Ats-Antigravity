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
exports.InterviewsController = void 0;
const common_1 = require("@nestjs/common");
const interviews_service_1 = require("./interviews.service");
const create_interview_dto_1 = require("./dto/create-interview.dto");
const update_interview_dto_1 = require("./dto/update-interview.dto");
const passport_1 = require("@nestjs/passport");
const team_guard_1 = require("../common/guards/team.guard");
const roles_guard_1 = require("../common/guards/roles.guard");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
let InterviewsController = class InterviewsController {
    interviewsService;
    constructor(interviewsService) {
        this.interviewsService = interviewsService;
    }
    create(createInterviewDto) {
        return this.interviewsService.create(createInterviewDto);
    }
    findAll() {
        return this.interviewsService.findAll();
    }
    findOne(id) {
        return this.interviewsService.findOne(id);
    }
    update(id, updateInterviewDto) {
        return this.interviewsService.update(id, updateInterviewDto);
    }
    remove(id) {
        return this.interviewsService.remove(id);
    }
};
exports.InterviewsController = InterviewsController;
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)('recruiter', 'team_admin', 'manager'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_interview_dto_1.CreateInterviewDto]),
    __metadata("design:returntype", void 0)
], InterviewsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, roles_decorator_1.Roles)('viewer', 'recruiter', 'team_admin', 'manager'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], InterviewsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, roles_decorator_1.Roles)('viewer', 'recruiter', 'team_admin', 'manager'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], InterviewsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, roles_decorator_1.Roles)('recruiter', 'team_admin', 'manager'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_interview_dto_1.UpdateInterviewDto]),
    __metadata("design:returntype", void 0)
], InterviewsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, roles_decorator_1.Roles)('team_admin'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], InterviewsController.prototype, "remove", null);
exports.InterviewsController = InterviewsController = __decorate([
    (0, common_1.Controller)('interviews'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt'), team_guard_1.TeamGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [interviews_service_1.InterviewsService])
], InterviewsController);
//# sourceMappingURL=interviews.controller.js.map