'use client';

import React from 'react';
import { Tabs } from 'antd';
import styled from 'styled-components';
import DefaceView from './DefaceView';

const { TabPane } = Tabs;

const CtiContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 24px;
  background: ${({ theme }) => theme.background};

  .ant-tabs, .ant-tabs-content, .ant-tabs-tabpane {
    display: flex;
    flex-direction: column;
    flex-grow: 1;
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
                <TabPane tab="Deface" key="deface">
                    <DefaceView />
                </TabPane>
                <TabPane tab="Vazamento de Senhas" key="pass_leak" disabled>
                    {/* Conteúdo futuro aqui */}
                </TabPane>
                <TabPane tab="Vazamento de E-mails" key="mail_leak" disabled>
                    {/* Conteúdo futuro aqui */}
                </TabPane>
            </Tabs>
        </CtiContainer>
    );
};

export default CtiModule;
