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
exports.TimesheetsController = void 0;
const common_1 = require("@nestjs/common");
const timesheets_service_1 = require("./timesheets.service");
const create_timesheet_dto_1 = require("./dto/create-timesheet.dto");
const update_timesheet_dto_1 = require("./dto/update-timesheet.dto");
const passport_1 = require("@nestjs/passport");
const team_guard_1 = require("../common/guards/team.guard");
const roles_guard_1 = require("../common/guards/roles.guard");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
let TimesheetsController = class TimesheetsController {
    timesheetsService;
    constructor(timesheetsService) {
        this.timesheetsService = timesheetsService;
    }
    create(createTimesheetDto) {
        return this.timesheetsService.create(createTimesheetDto);
    }
    findAll() {
        return this.timesheetsService.findAll();
    }
    findOne(id) {
        return this.timesheetsService.findOne(id);
    }
    update(id, updateTimesheetDto) {
        return this.timesheetsService.update(id, updateTimesheetDto);
    }
    remove(id) {
        return this.timesheetsService.remove(id);
    }
};
exports.TimesheetsController = TimesheetsController;
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)('candidate', 'team_admin', 'manager', 'recruiter'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_timesheet_dto_1.CreateTimesheetDto]),
    __metadata("design:returntype", void 0)
], TimesheetsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, roles_decorator_1.Roles)('candidate', 'team_admin', 'manager', 'recruiter'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], TimesheetsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, roles_decorator_1.Roles)('candidate', 'team_admin', 'manager', 'recruiter'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], TimesheetsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, roles_decorator_1.Roles)('team_admin', 'manager'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_timesheet_dto_1.UpdateTimesheetDto]),
    __metadata("design:returntype", void 0)
], TimesheetsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, roles_decorator_1.Roles)('team_admin'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], TimesheetsController.prototype, "remove", null);
exports.TimesheetsController = TimesheetsController = __decorate([
    (0, common_1.Controller)('timesheets'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt'), team_guard_1.TeamGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [timesheets_service_1.TimesheetsService])
], TimesheetsController);
//# sourceMappingURL=timesheets.controller.js.map