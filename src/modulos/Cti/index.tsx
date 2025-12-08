'use client';

import React from 'react';
import { Tabs } from 'antd';
import styled from 'styled-components';
import DefaceView from './DefaceView';
import PhishingView from './PhishingView';
import TakedownView from './TakedownView';
import VazamentoSenhasView from './VazamentoSenhasView';
import InfoDisclosureView from './InfoDisclosureView';

const { TabPane } = Tabs;

const CtiContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 24px;
  background: ${({ theme }) => theme.background};

  .ant-tabs, .ant-tabs-content {
    display: flex;
    flex-direction: column;
    flex-grow: 1;
  }

  .ant-tabs-tabpane {
      height: 100%;
  }

  .ant-tabs-content {
    overflow-y: auto;
    min-height: 0;
  }
`;

const CtiModule = () => {
    return (
        <CtiContainer>
            <Tabs defaultActiveKey="deface">
                <TabPane tab="Phishing" key="phishing">
                    <PhishingView />
                </TabPane>
                <TabPane tab="Deface" key="deface">
                    <DefaceView />
                </TabPane>
                <TabPane tab="Takedown" key="takedown">
                    <TakedownView />
                </TabPane>
                <TabPane tab="Vazamento de Senhas" key="pass_leak">
                    <VazamentoSenhasView />
                </TabPane>
                <TabPane tab="Information Disclosure" key="info_disclosure">
                    <InfoDisclosureView />
                </TabPane>
                <TabPane tab="Vazamento de E-mails" key="mail_leak" disabled>
                    {/* Conteúdo futuro aqui */}
                </TabPane>
            </Tabs>
        </CtiContainer>
    );
};

export default CtiModule;
