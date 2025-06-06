import React from 'react';
import {useOnyx} from 'react-native-onyx';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import TextLink from '@components/TextLink';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import {clearAdvancedFilters} from '@libs/actions/Search';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {SearchAdvancedFiltersForm} from '@src/types/form';
import AdvancedSearchFilters from './AdvancedSearchFilters';

function SearchAdvancedFiltersPage() {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const emptySearchFilters: SearchAdvancedFiltersForm = {} as SearchAdvancedFiltersForm;
    const [searchAdvancedFilters = emptySearchFilters] = useOnyx(ONYXKEYS.FORMS.SEARCH_ADVANCED_FILTERS_FORM, {canBeMissing: true});

    const shouldShowResetFilters = Object.entries(searchAdvancedFilters)
        .filter(([key]) => !([CONST.SEARCH.SYNTAX_ROOT_KEYS.TYPE, CONST.SEARCH.SYNTAX_ROOT_KEYS.STATUS, CONST.SEARCH.SYNTAX_ROOT_KEYS.GROUP_BY] as string[]).includes(key))
        .some(([, value]) => (Array.isArray(value) ? value.length !== 0 : !!value));

    return (
        <ScreenWrapper
            testID={SearchAdvancedFiltersPage.displayName}
            shouldShowOfflineIndicatorInWideScreen
            offlineIndicatorStyle={styles.mtAuto}
            includeSafeAreaPaddingBottom
        >
            <HeaderWithBackButton title={translate('search.filtersHeader')}>
                {shouldShowResetFilters && <TextLink onPress={clearAdvancedFilters}>{translate('search.resetFilters')}</TextLink>}
            </HeaderWithBackButton>
            <AdvancedSearchFilters />
        </ScreenWrapper>
    );
}

SearchAdvancedFiltersPage.displayName = 'SearchAdvancedFiltersPage';

export default SearchAdvancedFiltersPage;
