// @/theme/antd-theme.ts
import { ThemeConfig } from 'antd';

const theme: ThemeConfig = {
  token: {
    // Seed Token
    colorPrimary: '#00FF41',
    colorInfo: '#00FF41',
    colorSuccess: '#00FF41',
    colorWarning: '#FFA500',
    colorError: '#FF4D4F',
    colorTextBase: '#00FF41',
    colorBgBase: '#0A0A0A',
    fontFamily: 'Geist_Mono, monospace',
    // Alias Token
    colorBgContainer: '#1A1A1A',
    colorBorder: '#00d134',
  },
  components: {
    Card: {
      colorBgContainer: 'var(--panel-background)',
      colorBorderSecondary: 'var(--border-color)',
      colorTextHeading: 'var(--foreground)',
    },
    Tree: {
        colorBgContainer: 'var(--panel-background)',
        colorText: 'var(--foreground)',
        // Add other Tree component tokens here
    },
    Input: {
        colorBgContainer: 'var(--panel-background)',
        colorText: 'var(--foreground)',
        colorBorder: 'var(--border-color)',
        // Add other Input component tokens here
    },
    Button: {
        // colorPrimary: '#00FF41',
        // colorPrimaryHover: '#33ff66',
        // colorPrimaryActive: '#00cc33',
        // colorText: '#00FF41',
        // colorBgContainer: 'transparent',
        // colorBorder: '#00FF41',
    }
  },
};

export default theme;
