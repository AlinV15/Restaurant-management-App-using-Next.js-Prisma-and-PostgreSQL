import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import prisma from '@/lib/prisma';
import ConsumView from './ConsumView';
import ConsumEdit from './ConsumEdit';
import LoadingSpinner from '@/app/components/LoadingSpinner';
import { serializeData } from '@/app/utils/serialization'

// Server Component
async function ConsumPage({
    params,
    searchParams
}: {
    params: { slug: string },
    searchParams: { view?: string }
}) {
    const searchPara = await searchParams;
    const para = await params;
    const isView = searchPara.view === 'true';
    const consumId = parseInt(para.slug);

    if (isNaN(consumId)) {
        notFound();
    }

    // Fetch all required data
    const [consum, angajati, gestiuni, bunuri] = await Promise.all([
        prisma.consum.findUnique({
            where: { id_consum: consumId },
            include: {
                gestiune: true,
                sef: true,
                liniiConsum: {
                    include: {
                        bun: true
                    }
                }
            }
        }),
        prisma.angajati.findMany(),
        prisma.gestiune.findMany(),
        prisma.bun.findMany()
    ]);

    if (!consum) {
        notFound();
    }

    // Initial data for the store, serialize to handle Decimal objects
    const initialData = serializeData({
        consum,
        angajati,
        gestiuni,
        bunuri,
        liniiConsum: consum.liniiConsum
    });

    return (
        <Suspense fallback={<LoadingSpinner />}>
            {isView ? (
                <ConsumView initialData={initialData} />
            ) : (
                <ConsumEdit initialData={initialData} />
            )}
        </Suspense>
    );
}

export default ConsumPage;