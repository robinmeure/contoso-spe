// src/components/Layout.tsx

import React, { useEffect, useState } from 'react';
import { 
  tokens,
  Button,
  Tooltip,
  makeStyles,
  shorthands,
  Avatar,
} from '@fluentui/react-components';
import { 
  Database24Regular,
  Database24Filled,
  Folder24Regular,
  Folder24Filled,
  PersonCircle24Regular,
  Search24Regular,
  Search24Filled,
  SearchInfo24Filled
} from '@fluentui/react-icons';
import { ThemeToggle } from './ThemeToggle';
import { ContainerBrowser } from './containers/ContainerBrowser';
import { FileBrowser } from './files/FileBrowser';
import { SearchResultsPage } from './search/SearchResultsPage';
import { IContainer, IDriveItem } from '../api';
import { useContainerManagement } from '../hooks/useContainerManagement';
import { useFolderNavigation, NavigationItem } from '../hooks/useFolderNavigation';
import { useSearch } from '../hooks/useSearch';

// Define styles using FluentUI's makeStyles
const useStyles = makeStyles({
  container: {
    backgroundColor: tokens.colorNeutralBackground1,
    height: '100vh',
    display: 'flex',
    flexDirection: 'column',
  } as const,
  header: {
    backgroundColor: tokens.colorNeutralBackground2,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    ...shorthands.padding(tokens.spacingVerticalXS, tokens.spacingHorizontalM),
    zIndex: 10,
    borderBottom: `1px solid ${tokens.colorNeutralStroke1}`,
    height: '48px',
  } as const,
  logoSection: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalXS,
    flexShrink: 0,
  } as const,
  appTitle: {
    fontSize: tokens.fontSizeBase500,
    fontWeight: tokens.fontWeightSemibold,
    color: tokens.colorBrandForeground1,
  } as const,
  searchSection: {
    flexGrow: 1,
    display: 'flex',
    justifyContent: 'center',
    maxWidth: '800px',
    ...shorthands.margin('0', tokens.spacingHorizontalL),
  } as const,
  searchContainer: {
    width: '100%',
    maxWidth: '500px',
  } as const,
  actionsSection: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalS,
    flexShrink: 0,
    justifyContent: 'flex-end',
  } as const,
  profileSection: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalS,
    marginLeft: tokens.spacingHorizontalS,
  } as const,
  mainContent: {
    display: 'flex',
    flexGrow: 1,
    overflow: 'hidden',
    position: 'relative',
  } as const,
  leftRail: {
    display: 'flex',
    flexDirection: 'column',
    width: '48px',
    height: '100%',
    backgroundColor: tokens.colorNeutralBackground2,
    boxShadow: tokens.shadow4,
    zIndex: 5,
    paddingTop: tokens.spacingVerticalS,
    alignItems: 'center',
  } as const,
  railButton: {
    marginBottom: tokens.spacingVerticalS,
  } as const,
  mainArea: {
    flexGrow: 1,
    ...shorthands.padding(0, tokens.spacingHorizontalS),
    overflowY: 'auto',
    width: '100%',
    position: 'relative',
  } as const,
  browserContainer: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
  } as const,
  actionButton: {
    minWidth: '32px',
    height: '32px',
  } as const,
  verticalDivider: {
    height: '24px',
  } as const,
});

export const Layout: React.FC = () => {
  const [selectedItem, setSelectedItem] = useState<IDriveItem | null>(null);
  const [showContainers, setShowContainers] = useState<boolean>(false);
  const [showFiles, setShowFiles] = useState<boolean>(true);
  const [showSearch, setShowSearch] = useState<boolean>(false);
  
  // Custom hooks for different concerns
  const { selectedContainer, driveId, selectContainer } = useContainerManagement();
  const { currentFolderId, breadcrumbs, navigateToFolder, navigateToBreadcrumb, resetNavigation } = useFolderNavigation();
  const { searchQuery, isGlobalSearch, handleSearch } = useSearch();

  // Set up initial breadcrumb when container changes
  useEffect(() => {
    if (selectedContainer) {
      resetNavigation(selectedContainer.id, selectedContainer.displayName);
    }
    // Only depend on selectedContainer, since resetNavigation is now memoized
    // and won't change between renders
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedContainer]);

  // Handle container selection with side effects
  const handleContainerSelect = async (container: IContainer | null) => {
    try {
      if (container) {
        await selectContainer(container);
        
        // Navigate to file browser after selecting a container
        setShowContainers(false);
        setShowFiles(true);
        setShowSearch(false);
        
        // Reset selected item when changing containers
        setSelectedItem(null);
      }
    } catch (err) {
      console.error('Error in handleContainerSelect:', err);
    }
  };

  // Handle folder navigation with side effects
  const handleFolderNavigate = (item: IDriveItem, newBreadcrumbs: NavigationItem[]) => {
    navigateToFolder(item, newBreadcrumbs);
    setSelectedItem(null);
  };

  // Handle item selection
  const handleItemSelect = (item: IDriveItem | null) => {
    setSelectedItem(item);
  };

  // Toggle container browser visibility
  const toggleContainerBrowser = () => {
    setShowContainers(true);
    setShowFiles(false);
    setShowSearch(false);
  };

  // Toggle file browser visibility
  const toggleFileBrowser = () => {
    setShowFiles(true);
    setShowContainers(false);
    setShowSearch(false);
  };

  // Toggle search results page visibility
  const toggleSearchResults = () => {
    setShowSearch(true);
    setShowContainers(false);
    setShowFiles(false);
  };

  const styles = useStyles();

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.logoSection}>
          <div className={styles.appTitle}>
            <img style={{width: '150px', height:'32px'}} src="data:image/svg+xml;base64,PHN2ZyBpZD0iTGF5ZXJfMSIgZGF0YS1uYW1lPSJMYXllciAxIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDcxLjAzIDIxOC4xNyI+PGRlZnM+PHN0eWxlPi5jbHMtMXtmaWxsOiMyOWI0NzM7fS5jbHMtMntmaWxsOiM4YmM1M2Y7fTwvc3R5bGU+PC9kZWZzPjxwYXRoIGNsYXNzPSJjbHMtMSIgZD0iTTE4NC4yNSw3NS40OWMtLjEyLDE2LTEuNCwzMS44My02LDQ3LjI2LTExLDM3LjMyLTM5LjExLDU3LjktNzgsNTcuMjMtMi4wNywwLTQuMTYsMC02LjIyLS4xOC0xLjQ0LS4xMy0zLjU4Ljg5LTQuMTMtMS0uNDctMS41OCwxLjUxLTIuNTMsMi42LTMuNTRBMTk4LjYyLDE5OC42MiwwLDAsMCwxMzYsMTE2LjkxYTE4LDE4LDAsMCwwLDEuNzQtNC4zYy4zNy0xLjkyLS42NS0zLjMyLTIuNDYtNC4wOGEzLjQyLDMuNDIsMCwwLDAtNC4xNywxLjE3LDE0LjI0LDE0LjI0LDAsMCwwLTEuNSwyLjcxYy0yNi4xNSw1MS45Mi02OCw4NS40NC0xMjIuMSwxMDQuNzctMi44NywxLTYuMDYsMi4xOS03LjI5LTEuODctMS4xMy0zLjcsMi00LjU3LDQuNjktNS40N0EyMDYuOTEsMjA2LjkxLDAsMCwwLDY4LDE3NS42YzIuODgtMi4yOCwzLjQ1LTQuMzMsMi42OC03Ljg3LTMuNzgtMTcuMjYtNC43Mi0zNC42Ni0xLTUyLjA3LDYuODEtMzIuMSwyNi4wNy01NC44Miw1My44OS03MC45MSwxNS40My04LjkzLDMyLjEtMTQuNDcsNDkuNjUtMTcuNTEsNC41Ni0uNzksNi42My41NCw3LjMzLDUuMzJBMzU0LjczLDM1NC43MywwLDAsMSwxODQuMjUsNzUuNDlaIi8+PHBhdGggY2xhc3M9ImNscy0yIiBkPSJNNTkuODYsMTUwLjI2QzQzLjU0LDEzOC4zNSwzMS41MiwxMjQsMjQuNDMsMTA1LjgxYy0xMC41Mi0yNy04LjgzLTU0LjI3LTEuNS04MS42MUExNTIuNjQsMTUyLjY0LDAsMCwxLDMwLjA5LDMuNjNDMzEuNDcuNCwzMy40My0uOTQsMzcuLjcxYzIzLjUyLDEwLjgyLDQ1Ljg3LDIzLjQ0LDY1LjE3LDQxLDMuNDUsMy4xNSw0LjQxLDQuNjItLjA3LDguMS0yNy40MSwyMS4zLTQxLDQ5Ljc2LTQyLjIxLDg0LjNDNTkuNzEsMTM5LjE0LDU5Ljg2LDE0NC4xNiw1OS44NiwxNTAuMjZaIi8+PHBhdGggY2xhc3M9ImNscy0xIiBkPSJNMzEzLjM3LDEzMi4yMmwtMS41NCwyOC41M2E0My4yMSw0My4yMSwwLDAsMS0xNS45MywzLjU4QTM2LjU5LDM2LjU5LDAsMCwxLDI2OCwxNTIuMThxLTEyLjY3LTEzLjYzLTEyLjY3LTM4LjU3LDAtMjMuMzUsMTEuOS0zNy40OVQyOTksNjIuMDVhMzguNTksMzguNTksMCwwLDEsMTMuMTgsMi40M1Y5Mi42OXEtNi02LTEyLjIyLTZhMTQuNTMsMTQuNTMsMCwwLDAtMTIuNzksN3EtNC42LDctNC42MSwxOS40NWE0NS41NSw0NS41NSwwLDAsMCwxLjE1LDEwLjc1LDI1LjQyLDI1LjQyLDAsMCwwLDMuMyw4LDE0LjE5LDE0LjE5LDAsMCwwLDEyLjQ0LDYuNzJRMzA2LjM5LDEzOC42MiwzMTMuMzcsMTMyLjIyWiIvPjxwYXRoIGNsYXNzPSJjbHMtMSIgZD0iTTM5Ni4zOSwxMTMuNTRxMCwyMi41OS0xMC4yOSwzNi43MnQtMjYuNjgsMTQuMDdhMzMuNTEsMzMuNTEsMCwwLDEtMjUtMTAuODFxLTEzLjExLTEzLjY4LTEzLjExLTQxLjA2LDAtMjYuMjMsMTMuNjktNDAuMTFhMzIuNzQsMzIuNzQsMCwwLDEsMjQuMTEtMTAuM3ExNy4wOCwwLDI3LjE5LDE0VDM5Ni4zOSwxMTMuNTRabS0yNy42OS4xOXEwLTI2Ljc5LTkuNDctMjYuOC00Ljc0LDAtNy41NSw3LTIuNzQsNi41Mi0yLjc1LDE5LjE5LDAsMTIuNDcsMi41OSwxOS4zNXQ3LjIsNi44N2MzLjE1LDAsNS41OC0yLjI1LDcuMjktNi43OFMzNjguNywxMjEuNzksMzY4LjcsMTEzLjczWiIvPjxwYXRoIGNsYXNzPSJjbHMtMSIgZD0iTTQwNy43OCwxNjIuNlY2My44NGgyNS40NmwxMy4zNywzNC42N2MuNzIsMiwxLjU0LDQuMzksMi40Niw3czEuOTMsNS42OSwzLDkuMTRsMi43NSw4LjdxLTEuNDctMTIuODYtMi4yNC0yMlQ0NTEuODUsODZWNjMuODRoMjUuNDZWMTYyLjZINDUxLjg1bC0xMy40My0zNi4zM3EtMi4xMi01LjgyLTMuODEtMTAuOXQtMyw5LjY5cS44MywxMC40MiwxLjIxLDE4LjE2dC4zOSwxMy41NnYyNS4yWiIvPjxwYXRoIGNsYXNzPSJjbHMtMSIgZD0iTTUyNS42LDE2Mi42SDQ5OC45M1Y4Ny41MUg0ODQuMjJWNjMuODRoNTYuNjdWODcuNTFINTI1LjZaIi8+PHBhdGggY2xhc3M9ImNscy0xIiBkPSJNNjIxLDExMy41NHEwLDIyLjU5LTEwLjMsMzYuNzJ0LTI2LjY3LDE0LjA3YTMzLjQ5LDMzLjQ5LDAsMCwxLTI1LTEwLjgxcS0xMy4xMi0xMy42OC0xMy4xMi00MS4wNiwwLTI2LjIzLDEzLjY5LTQwLjExYTMyLjc0LDMyLjc0LDAsMCwxLDI0LjEyLTEwLjNxMTcuMDgsMCwyNy4xOCwxNFQ2MjEsMTEzLjU0Wm0tMjcuNy4xOXEwLTI2Ljc5LTkuNDctMjYuOC00LjczLDAtNy41NCw3LTIuNzYsNi41Mi0yLjc1LDE5LjE5LDAsMTIuNDcsMi41OSwxOS4zNXQ3LjE5LDYuODdjMy4xNiwwLDUuNTktMi4yNSw3LjI5LTYuNzhTNTkzLjM0LDEyMS43OSw1OTMuMzQsMTEzLjczWiIvPjxwYXRoIGNsYXNzPSJjbHMtMSIgZD0iTTYzMC4zMSwxNjAuMTd2LTMxcTcuODgsMTAuNzQsMTcsMTAuNzVhOC40NSw4LjQ1LDAsMCwwLDUuNjMtMS44Myw1LjcxLDUuNzEsMCwwLDAsMi4xNy00LjU3cTAtNC00LjczLTcuNzRsLTQuMzUtMy4zOWE1OS40NCw1OS40NCwwLDAsMS03LjQyLTYuNDksMzMuMywzMy4zLDAsMCwxLTUtNi42NSwyOC4zOCwyOC4zOCwwLDAsMS0yLjgyLTcuMDcsMzIuNDUsMzIuNDUsMCwwLDEtLjg5LTcuNjhBMzYuODgsMzYuODgsMCwwLDEsNjMzLjEzLDgwYTM2LjI0LDM2LjI0LDAsMCwxLDMuNzEtNi40MywyNi43LDI2LjcsMCwwLDEsNC44Ni01LjE1LDI3LjIzLDI3LjIzLDAsMCwxLDE4LjIzLTYuNCw0MS4yMyw0MS4yMywwLDAsMSwxOS4xOSw1Vjk3LjNhMjguMzIsMjguMzIsMCwwLDAtNy40Mi04LDE0LjI3LDE0LjI3LDAsMCwwLTguMTktMi45MSw3LjI1LDcuMjUsMCwwLDAtNSwxLjc5LDUuMjYsNS4yNiwwLDAsMC0yLjA1LDQuMTZxMCw0LDUuNDQsNy44N2w0LjIyLDMuMTNxOC40NSw2LjA3LDEyLjA5LDEyLjQ4YTI5LjMxLDI5LjMxLDAsMCwxLDMuNzEsMTVxMCwxNC41OS04Ljg5LDI0LjA1dC0yMi41Miw5LjQ3QTU2LjA4LDU2LjA4LDAsMCwxLDYzMC4zMSwxNjAuMTdaIi8+PHBhdGggY2xhc3M9ImNscy0xIiBkPSJNNzY0Ljg5LDExMy41NHEwLDIyLjU5LTEwLjI5LDM2LjcydC0yNi42OCwxNC4wN2EzMy41MSwzMy41MSwwLDAsMS0yNS0xMC44MXEtMTMuMTEtMTMuNjgtMTMuMTEtNDEuMDYsMC0yNi4yMywxMy42OS00MC4xMWEzMi43NCwzMi43NCwwLDAsMSwyNC4xMS0xMC4zcTE3LjA4LDAsMjcuMTksMTRUNzY0Ljg5LDExMy41NFptLTI3LjY5LjE5cTAtMjYuNzktOS40Ny0yNi44LTQuNzIsMC03LjU1LDctMi43NCw2LjUyLTIuNzUsMTkuMTksMCwxMi40NywyLjU5LDE5LjM1dDcuMiw2Ljg3YzMuMTUsMCw1LjU4LTIuMjUsNy4yOS02Ljc4UzczNy4yLDEyMS43OSw3MzcuMiwxMTMuNzNaIi8+PHBhdGggY2xhc3M9ImNscy0xIiBkPSJNODA2LjkyLDEzOWwtMTcuMjcsNDcuNDZoLTIxTDc4MC42OSwxMzlaIi8+PHBhdGggY2xhc3M9ImNscy0xIiBkPSJNOTAxLjc4LDE2Mi42SDg1NS4wOVY2My44NGgyNi42N3Y3NWgyMFoiLz48cGF0aCBjbGFzcz0iY2xzLTEiIGQ9Ik05NDEuNDQsMTYyLjZIOTE0Ljc2Vjg3Lj51SDkwMC4wNVY2My44NGg1Ni42OFY4Ny41MUg5NDEuNDRaIi8+PHBhdGggY2xhc3M9ImNscy0xIiBkPSJNOTYzLjYzLDE2Mi42VjYzLjg0aDIzcTE5Ljc3LDAsMzAuNzcsMTAuNjIsMTQuNDUsMTMuODgsMTQuNDUsMzguODMsMCwyNC41NS0xMi4yMSwzNy45My0xMC40MiwxMS4zOS0zMS4wOSwxMS4zOFptMjYuNjgtMjMuODVxMTQuMzMtLjcsMTQuMzMtMjQuNywwLTExLjgyLTMuNjUtMTguNjd0LTkuODUtNi45MWgtLjgzWiIvPjxwYXRoIGNsYXNzPSJjbHMtMSIgZD0iTTEwNzEsMTQ5LjQzYTEzLjg1LDEzLjg1LDAsMCwxLTQuNDEsMTAuMywxNC4zLDE0LjMsMCwwLDEtMTAuNDksNC4yOCwxNSwxNSwwLDAsMS0xMC42OS00LjM1QTE0LjU1LDE0LjU1LDAsMCwxLDEwNDEsMTQ5YTE0Ljg1LDE0Ljg1LDAsMCwxLDE0Ljg0LTE0Ljg0LDE0LjUzLDE0LjUzLDAsMCwxLDEwLjc1LDQuNDhBMTQuNjksMTQuNjksMCwwLDEsMTA3MSwxNDkuNDNaIi8+PC9zdmc+"/>
          </div>
        </div>
       
        <div className={styles.actionsSection}>
          <ThemeToggle />
          <div className={styles.profileSection}>
            <Avatar
              name="User"
              size={28}
              icon={<PersonCircle24Regular />}
              aria-label="User Profile"
            />
          </div>
        </div>
      </header>
      
      <div className={styles.mainContent}>
        {/* Left rail for navigation icons */}
        <div className={styles.leftRail}>
          <Tooltip content="Containers" relationship="label" positioning="after">
            <Button
              icon={showContainers ? <Database24Filled /> : <Database24Regular />}
              appearance="subtle"
              className={styles.railButton}
              onClick={toggleContainerBrowser}
              aria-label="Container Browser"
            />
          </Tooltip>
          <Tooltip content="Files" relationship="label" positioning="after">
            <Button
              icon={showFiles ? <Folder24Filled /> : <Folder24Regular />}
              appearance="subtle"
              className={styles.railButton}
              onClick={toggleFileBrowser}
              aria-label="File Browser"
            />
          </Tooltip>
          <Tooltip content="Search" relationship="label" positioning="after">
            <Button
              icon={showSearch ? <SearchInfo24Filled /> : <Search24Regular />}
              appearance="subtle"
              className={styles.railButton}
              onClick={toggleSearchResults}
              aria-label="Search Results"
            />
          </Tooltip>
          {/* Additional rail buttons can be added here */}
        </div>
        
        <main className={styles.mainArea}>
          {showContainers ? (
            <div className={styles.browserContainer}>
              <ContainerBrowser 
                onContainerSelect={handleContainerSelect}
                selectedContainer={selectedContainer}
              />
            </div>
          ) : showFiles ? (
            <FileBrowser
              driveId={driveId}
              folderId={currentFolderId}
              searchQuery={searchQuery}
              isGlobalSearch={isGlobalSearch}
              onFolderNavigate={handleFolderNavigate}
              breadcrumbs={breadcrumbs}
              onItemSelect={handleItemSelect}
              selectedItem={selectedItem}
              onBreadcrumbNavigate={navigateToBreadcrumb}
              onNavigateToContainers={toggleContainerBrowser}
            />
          ) : showSearch ? (
            <SearchResultsPage initialQuery={searchQuery} />
          ) : null}
        </main>
      </div>
    </div>
  );
};