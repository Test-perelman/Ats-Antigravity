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
exports.SubmissionsController = void 0;
const common_1 = require("@nestjs/common");
const submissions_service_1 = require("./submissions.service");
const create_submission_dto_1 = require("./dto/create-submission.dto");
const update_submission_dto_1 = require("./dto/update-submission.dto");
const passport_1 = require("@nestjs/passport");
const team_guard_1 = require("../common/guards/team.guard");
const roles_guard_1 = require("../common/guards/roles.guard");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
let SubmissionsController = class SubmissionsController {
    submissionsService;
    constructor(submissionsService) {
        this.submissionsService = submissionsService;
    }
    create(createSubmissionDto) {
        return this.submissionsService.create(createSubmissionDto);
    }
    findAll() {
        return this.submissionsService.findAll();
    }
    findOne(id) {
        return this.submissionsService.findOne(id);
    }
    update(id, updateSubmissionDto) {
        return this.submissionsService.update(id, updateSubmissionDto);
    }
    remove(id) {
        return this.submissionsService.remove(id);
    }
};
exports.SubmissionsController = SubmissionsController;
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)('recruiter', 'team_admin', 'manager'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_submission_dto_1.CreateSubmissionDto]),
    __metadata("design:returntype", void 0)
], SubmissionsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, roles_decorator_1.Roles)('viewer', 'recruiter', 'team_admin', 'manager'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], SubmissionsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, roles_decorator_1.Roles)('viewer', 'recruiter', 'team_admin', 'manager'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], SubmissionsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, roles_decorator_1.Roles)('recruiter', 'team_admin', 'manager'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_submission_dto_1.UpdateSubmissionDto]),
    __metadata("design:returntype", void 0)
], SubmissionsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, roles_decorator_1.Roles)('team_admin'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], SubmissionsController.prototype, "remove", null);
exports.SubmissionsController = SubmissionsController = __decorate([
    (0, common_1.Controller)('submissions'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt'), team_guard_1.TeamGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [submissions_service_1.SubmissionsService])
], SubmissionsController);
//# sourceMappingURL=submissions.controller.js.map