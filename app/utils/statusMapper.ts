import { StatusCerere as PrismaStatusCerere } from "@prisma/client";
import { StatusCerere as AppStatusCerere } from "@/lib/classes/CerereAprovizionare";

export function mapToPrismaStatus(status: AppStatusCerere): PrismaStatusCerere {
    switch (status) {
        case AppStatusCerere.IN_ASTEPTARE: return PrismaStatusCerere.IN_ASTEPTARE;
        case AppStatusCerere.APROBATA: return PrismaStatusCerere.APROBATA;
        case AppStatusCerere.RESPINSA: return PrismaStatusCerere.RESPINSA;
        case AppStatusCerere.FINALIZATA: return PrismaStatusCerere.FINALIZATA;
    }
}
