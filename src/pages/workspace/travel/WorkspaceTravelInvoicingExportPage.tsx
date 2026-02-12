import {format} from 'date-fns';
import React, {useCallback, useMemo, useRef, useState} from 'react';
import {View} from 'react-native';
import FullPageOfflineBlockingView from '@components/BlockingViews/FullPageOfflineBlockingView';
import Button from '@components/Button';
import FormAlertWithSubmitButton from '@components/FormAlertWithSubmitButton';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import DatePresetFilterBase from '@components/Search/FilterComponents/DatePresetFilterBase';
import type {SearchDatePresetFilterBaseHandle, SearchDateValues} from '@components/Search/FilterComponents/DatePresetFilterBase';
import type {SearchDatePreset} from '@components/Search/types';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import {getTravelInvoiceStatement} from '@libs/actions/TravelInvoicing';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import {isSearchDatePreset} from '@libs/SearchQueryUtils';
import {getDateRangeForPreset} from '@libs/SearchUIUtils';
import type {SearchDateModifier} from '@libs/SearchUIUtils';
import CONST from '@src/CONST';
import type SCREENS from '@src/SCREENS';

type WorkspaceTravelInvoicingExportPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.TRAVEL_EXPORT>;

function WorkspaceTravelInvoicingExportPage({route}: WorkspaceTravelInvoicingExportPageProps) {
    const {policyID} = route.params;
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const searchDatePresetFilterBaseRef = useRef<SearchDatePresetFilterBaseHandle>(null);
    const [selectedDateModifier, setSelectedDateModifier] = useState<SearchDateModifier | null>(null);

    const presets: SearchDatePreset[] = [CONST.SEARCH.DATE_PRESETS.THIS_MONTH, CONST.SEARCH.DATE_PRESETS.LAST_MONTH];

    const defaultDateValues = useMemo(
        (): SearchDateValues => ({
            // Default to This month
            [CONST.SEARCH.DATE_MODIFIERS.ON]: CONST.SEARCH.DATE_PRESETS.THIS_MONTH,
            [CONST.SEARCH.DATE_MODIFIERS.BEFORE]: undefined,
            [CONST.SEARCH.DATE_MODIFIERS.AFTER]: undefined,
        }),
        [],
    );

    function getComputedTitle() {
        if (selectedDateModifier) {
            return translate(`common.${selectedDateModifier.toLowerCase() as Lowercase<SearchDateModifier>}`);
        }
        return translate('common.export');
    }

    const goBack = () => {
        if (selectedDateModifier) {
            setSelectedDateModifier(null);
            return;
        }
        Navigation.goBack();
    };

    const save = useCallback(() => {
        if (!searchDatePresetFilterBaseRef.current || !selectedDateModifier) {
            return;
        }

        searchDatePresetFilterBaseRef.current.setDateValueOfSelectedDateModifier();
        setSelectedDateModifier(null);
    }, [selectedDateModifier]);

    const reset = useCallback(() => {
        if (!searchDatePresetFilterBaseRef.current) {
            return;
        }

        if (selectedDateModifier) {
            searchDatePresetFilterBaseRef.current.clearDateValueOfSelectedDateModifier();
            setSelectedDateModifier(null);
            return;
        }

        searchDatePresetFilterBaseRef.current.clearDateValues();
    }, [selectedDateModifier]);

    const handleDownload = (type: 'csv' | 'pdf') => {
        const values = searchDatePresetFilterBaseRef.current?.getDateValues();
        const dateOn = values?.[CONST.SEARCH.DATE_MODIFIERS.ON];
        const dateAfter = values?.[CONST.SEARCH.DATE_MODIFIERS.AFTER];
        const dateBefore = values?.[CONST.SEARCH.DATE_MODIFIERS.BEFORE];

        let formattedPeriod = '';
        if (dateOn) {
            if (isSearchDatePreset(dateOn)) {
                const range = getDateRangeForPreset(dateOn);
                // For presets like "This month", keep yyyyMM
                formattedPeriod = range.start.replaceAll('-', '').substring(0, 6);
            } else {
                // Specific date "On" -> yyyyMMdd
                formattedPeriod = dateOn.replaceAll('-', '');
            }
        } else if (dateAfter || dateBefore) {
            // Range handling: start-end format with yyyyMMdd
            const start = dateAfter ? dateAfter.replaceAll('-', '') : '';
            const end = dateBefore ? dateBefore.replaceAll('-', '') : '';
            formattedPeriod = `${start}-${end}`;
        } else {
            // Default to this month
            formattedPeriod = format(new Date(), 'yyyyMM');
        }

        getTravelInvoiceStatement(policyID, formattedPeriod, type, translate);
    };

    const computedTitle = getComputedTitle();

    return (
        <ScreenWrapper
            testID="WorkspaceTravelInvoicingExportPage"
            shouldShowOfflineIndicatorInWideScreen
            offlineIndicatorStyle={styles.mtAuto}
            includeSafeAreaPaddingBottom
            shouldEnableMaxHeight
        >
            <HeaderWithBackButton
                title={computedTitle}
                onBackButtonPress={goBack}
            />
            <FullPageOfflineBlockingView>
                <ScrollView contentContainerStyle={styles.flexGrow1}>
                    <DatePresetFilterBase
                        ref={searchDatePresetFilterBaseRef}
                        defaultDateValues={defaultDateValues}
                        selectedDateModifier={selectedDateModifier}
                        onSelectDateModifier={setSelectedDateModifier}
                        presets={presets}
                    />
                </ScrollView>
                <View style={[styles.ph5, styles.pb5]}>
                    {/* When date modifier is set (On, After and Before) show Reset / Save buttons, otherwise show Export buttons */}
                    {!selectedDateModifier ? (
                        <>
                            <Button
                                text={translate('workspace.moreFeatures.travel.exportToPDF')}
                                onPress={() => handleDownload('pdf')}
                                large
                                style={styles.mb3}
                            />
                            <Button
                                success
                                text={translate('workspace.moreFeatures.travel.exportToCSV')}
                                onPress={() => handleDownload('csv')}
                                large
                            />
                        </>
                    ) : (
                        <>
                            <Button
                                text={translate('common.reset')}
                                onPress={reset}
                                style={styles.mb3}
                                large
                            />
                            <FormAlertWithSubmitButton
                                buttonText={translate('common.save')}
                                onSubmit={save}
                                enabledWhenOffline
                            />
                        </>
                    )}
                </View>
            </FullPageOfflineBlockingView>
        </ScreenWrapper>
    );
}

WorkspaceTravelInvoicingExportPage.displayName = 'WorkspaceTravelInvoicingExportPage';

export default WorkspaceTravelInvoicingExportPage;
