import {useMemo} from 'react';
import useLocalize from '@hooks/useLocalize';
import type {ImportOptionTranslations} from '@pages/workspace/accounting/intacct/types';
import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import type {SageIntacctConnectionsConfig} from '@src/types/onyx/Policy';

/**
 * Custom hook to get the translations based on integration configuration.
 */
function useSageIntacctImportTranslations(config?: SageIntacctConnectionsConfig): ImportOptionTranslations {
    const {translate} = useLocalize();

    return useMemo(() => {
        const isExpenseType = config?.export?.reimbursable === CONST.SAGE_INTACCT_REIMBURSABLE_EXPENSE_TYPE.EXPENSE_REPORT;

        if (isExpenseType) {
            return {
                title: translate('workspace.intacct.expenseTypes'),
                subtitle: translate('workspace.intacct.expenseTypesDescription'),
                accessibilityLabel: translate('workspace.intacct.expenseTypesDescription'),
            };
        }

        return {
            title: translate('workspace.intacct.vendorBills'),
            subtitle: translate('workspace.intacct.vendorBillsDescription' as TranslationPaths),
            accessibilityLabel: translate('workspace.intacct.vendorBillsDescription' as TranslationPaths),
        };
    }, [config?.export?.reimbursable, translate]);
}

export default useSageIntacctImportTranslations;
