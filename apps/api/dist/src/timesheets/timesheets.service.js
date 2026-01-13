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
Object.defineProperty(exports, "__esModule", { value: true });
exports.TimesheetsService = void 0;
const common_1 = require("@nestjs/common");
const team_prisma_service_1 = require("../prisma/team-prisma.service");
let TimesheetsService = class TimesheetsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(createTimesheetDto) {
        const { candidateId, projectId, hours, status, weekEnding } = createTimesheetDto;
        return this.prisma.client.timesheet.create({
            data: {
                candidateId,
                projectId,
                hours,
                status: status || 'draft',
                weekEnding: new Date(weekEnding),
            },
        });
    }
    async findAll() {
        return this.prisma.client.timesheet.findMany({
            orderBy: { weekEnding: 'desc' },
            include: {
                project: true,
                candidate: true
            }
        });
    }
    async findOne(id) {
        return this.prisma.client.timesheet.findUnique({
            where: { id },
            include: {
                project: true,
                candidate: true
            }
        });
    }
    async update(id, updateTimesheetDto) {
        const data = { ...updateTimesheetDto };
        if (data.weekEnding)
            data.weekEnding = new Date(data.weekEnding);
        delete data.periodStart;
        delete data.periodEnd;
        return this.prisma.client.timesheet.update({
            where: { id },
            data: data,
        });
    }
    async remove(id) {
        return this.prisma.client.timesheet.delete({
            where: { id },
        });
    }
};
exports.TimesheetsService = TimesheetsService;
exports.TimesheetsService = TimesheetsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [team_prisma_service_1.TeamPrismaService])
], TimesheetsService);
//# sourceMappingURL=timesheets.service.js.map