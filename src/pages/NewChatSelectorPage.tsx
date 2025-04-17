import {useNavigation} from '@react-navigation/native';
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {useOnyx} from 'react-native-onyx';
import type {NativeProps} from 'react-native-pager-view/lib/typescript/specs/PagerViewNativeComponent';
import FocusTrapContainerElement from '@components/FocusTrap/FocusTrapContainerElement';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import type {AnimatedTextInputRef} from '@components/RNTextInput';
import ScreenWrapper from '@components/ScreenWrapper';
import TabSelector from '@components/TabSelector/TabSelector';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import {setNewRoomFormLoading} from '@libs/actions/Report';
import OnyxTabNavigator, {TabScreenWithFocusTrapWrapper, TopTab} from '@libs/Navigation/OnyxTabNavigator';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import NewChatPage from './NewChatPage';
import type {NewChatPageHandle} from './NewChatPage';
import WorkspaceNewRoomPage from './workspace/WorkspaceNewRoomPage';

function NewChatSelectorPage() {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const navigation = useNavigation();
    // The focus trap container elements of the header and back button, tab bar, and active tab
    const [headerWithBackBtnContainerElement, setHeaderWithBackButtonContainerElement] = useState<HTMLElement | null>(null);
    const [tabBarContainerElement, setTabBarContainerElement] = useState<HTMLElement | null>(null);
    const [activeTabContainerElement, setActiveTabContainerElement] = useState<HTMLElement | null>(null);
    const [formState] = useOnyx(ONYXKEYS.FORMS.NEW_ROOM_FORM);
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const chatPageInputRef = useRef<NewChatPageHandle>(null);
    const roomPageInputRef = useRef<AnimatedTextInputRef>(null);

    // Theoretically, the focus trap container element can be null (due to component unmount/remount), so we filter out the null elements
    const containerElements = useMemo(() => {
        return [headerWithBackBtnContainerElement, tabBarContainerElement, activeTabContainerElement].filter((element) => !!element) as HTMLElement[];
    }, [headerWithBackBtnContainerElement, tabBarContainerElement, activeTabContainerElement]);

    const onTabFocusTrapContainerElementChanged = useCallback((activeTabElement?: HTMLElement | null) => {
        setActiveTabContainerElement(activeTabElement ?? null);
    }, []);

    useEffect(() => {
        setNewRoomFormLoading(false);
    }, []);

    const handleOnPageSelected: NativeProps['onPageSelected'] = (event) => {
        const {position} = event.nativeEvent;
        // Chat tab (0) / Room tab (1) according to OnyxTabNavigator (see below)
        if (position === 0) {
            chatPageInputRef.current?.selectionList?.focusTextInput();
        } else if (position === 1) {
            roomPageInputRef.current?.focus();
        }
    };

    return (
        <ScreenWrapper
            enableEdgeToEdgeBottomSafeAreaPadding
            shouldEnableKeyboardAvoidingView={false}
            shouldShowOfflineIndicator={false}
            shouldEnableMaxHeight
            testID={NewChatSelectorPage.displayName}
            focusTrapSettings={{containerElements}}
        >
            <FocusTrapContainerElement
                onContainerElementChanged={setHeaderWithBackButtonContainerElement}
                style={[styles.w100]}
            >
                <HeaderWithBackButton
                    title={translate('sidebarScreen.fabNewChat')}
                    onBackButtonPress={navigation.goBack}
                />
            </FocusTrapContainerElement>

            <OnyxTabNavigator
                id={CONST.TAB.NEW_CHAT_TAB_ID}
                tabBar={TabSelector}
                onTabBarFocusTrapContainerElementChanged={setTabBarContainerElement}
                onActiveTabFocusTrapContainerElementChanged={onTabFocusTrapContainerElementChanged}
                disableSwipe={!!formState?.isLoading && shouldUseNarrowLayout}
                onPageSelected={handleOnPageSelected}
            >
                <TopTab.Screen name={CONST.TAB.NEW_CHAT}>
                    {() => (
                        <TabScreenWithFocusTrapWrapper>
                            <NewChatPage ref={chatPageInputRef} />
                        </TabScreenWithFocusTrapWrapper>
                    )}
                </TopTab.Screen>
                <TopTab.Screen name={CONST.TAB.NEW_ROOM}>
                    {() => (
                        <TabScreenWithFocusTrapWrapper>
                            <WorkspaceNewRoomPage ref={roomPageInputRef} />
                        </TabScreenWithFocusTrapWrapper>
                    )}
                </TopTab.Screen>
            </OnyxTabNavigator>
        </ScreenWrapper>
    );
}

NewChatSelectorPage.displayName = 'NewChatSelectorPage';

export default NewChatSelectorPage;
