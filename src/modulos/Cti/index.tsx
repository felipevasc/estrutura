'use client';

import React from 'react';
import { Tabs, Layout } from 'antd';
import styled from 'styled-components';
import DefaceView from './DefaceView'; // Será criado na próxima etapa

const { Content } = Layout;
const { TabPane } = Tabs;

const CtiContainer = styled(Content)`
  padding: 24px;
  margin: 0;
  min-height: 280px;
  background: ${({ theme }) => theme.background};
`;

const CtiModule = () => {
    return (
        <Layout style={{ padding: '0 24px 24px' }}>
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
        </Layout>
    );
};

export default CtiModule;
