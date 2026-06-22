import * as React from 'react';
import {
  Card,
  CardBody,
  CardExpandableContent,
  CardHeader,
  CardTitle,
  Content,
  Flex,
  FlexItem,
  Grid,
  GridItem,
  PageSection,
  Stack,
  StackItem,
  Title,
} from '@patternfly/react-core';
import clusterSettingsIconSvg from '../assets/enable-team-server-settings-icon.svg';
import notebookImagesIconSvg from '../assets/enable-team-notebook-images-icon.svg';
import servingRuntimesIconSvg from '../assets/enable-team-serving-runtimes-icon.svg';
import userManagementIconSvg from '../assets/enable-team-user-management-icon.svg';

const ENABLE_CARD_ID = 'rhoai-home-enable-team-card';

type EnableTeamCard = {
  id: string;
  title: string;
  description: string;
  iconSvg: string;
  iconAlt: string;
};

const ENABLE_TEAM_CARDS: EnableTeamCard[] = [
  {
    id: 'notebook-images',
    title: 'Notebook images',
    description:
      'These are instances of your development and experimentation environment. They typically contain IDEs, such as JupyterLab, RStudio, and Visual Studio Code.',
    iconSvg: notebookImagesIconSvg,
    iconAlt: 'Notebook images icon',
  },
  {
    id: 'serving-runtimes',
    title: 'Serving runtimes',
    description:
      'Administrators can access notebook servers that are owned by other users to correct configuration errors or help a data scientist troubleshoot problems with their environment.',
    iconSvg: servingRuntimesIconSvg,
    iconAlt: 'Serving runtimes icon',
  },
  {
    id: 'cluster-settings',
    title: 'Cluster settings',
    description:
      "You can change the default size of the cluster's persistent volume claim (PVC) ensuring that the storage requested matches your common storage workflow.",
    iconSvg: clusterSettingsIconSvg,
    iconAlt: 'Cluster settings icon',
  },
  {
    id: 'user-management',
    title: 'User management',
    description:
      'You can restrict access to your instance by defining specialized user groups. You must grant users permission access by adding user accounts to the Red Hat OpenShift AI user group, administrator group, or both.',
    iconSvg: userManagementIconSvg,
    iconAlt: 'User management icon',
  },
];

const EnableYourTeamSection: React.FunctionComponent = () => {
  const [isExpanded, setIsExpanded] = React.useState(false);

  const onExpand = React.useCallback((_event: React.MouseEvent, id: string) => {
    if (id === ENABLE_CARD_ID) {
      setIsExpanded((e) => !e);
    }
  }, []);

  return (
    <PageSection variant="default" hasBodyWrapper={false} data-testid="home-enable-your-team">
      <Card id={ENABLE_CARD_ID} isExpanded={isExpanded}>
        <CardHeader
          onExpand={onExpand}
          toggleButtonProps={{
            id: 'home-enable-your-team-expand',
            'aria-label': 'Enable your team',
            'aria-labelledby': `${ENABLE_CARD_ID}-title home-enable-your-team-expand`,
            'aria-expanded': isExpanded,
          }}
        >
          <Flex alignItems={{ default: 'alignItemsCenter' }} gap={{ default: 'gapSm' }}>
            <CardTitle
              id={`${ENABLE_CARD_ID}-title`}
              component="h2"
              className="rhoai-home-section-title-md"
            >
              Enable your team
            </CardTitle>
          </Flex>
        </CardHeader>
        <CardExpandableContent>
          <CardBody id="home-enable-your-team-body">
            <Grid hasGutter lg={3} md={6} sm={12}>
              {ENABLE_TEAM_CARDS.map((card) => (
                <GridItem key={card.id}>
                  <Card id={`home-enable-team-${card.id}-card`} className="rhoai-enable-team-item-card">
                    <CardBody>
                      <Stack hasGutter>
                        <StackItem>
                          <Flex alignItems={{ default: 'alignItemsCenter' }} gap={{ default: 'gapSm' }}>
                            <FlexItem>
                              <div
                                className="pf-v6-u-display-flex pf-v6-u-align-items-center pf-v6-u-justify-content-center rhoai-enable-team-card-icon-shell"
                                style={{
                                  width: 40,
                                  height: 40,
                                  borderRadius: '50%',
                                  backgroundColor: '#FFE8CC',
                                }}
                                aria-hidden
                              >
                                <span
                                  className="rhoai-enable-team-card-icon-mark"
                                  role="img"
                                  aria-label={card.iconAlt}
                                  dangerouslySetInnerHTML={{ __html: card.iconSvg }}
                                />
                              </div>
                            </FlexItem>
                          </Flex>
                        </StackItem>
                        <StackItem>
                          <Title headingLevel="h4" id={`home-enable-team-${card.id}-title`} className="pf-v6-u-mb-xs">
                            <a href="#" id={`home-enable-team-${card.id}-link`} onClick={(e) => e.preventDefault()}>
                              {card.title}
                            </a>
                          </Title>
                        </StackItem>
                        <StackItem>
                          <Content component="p" className="pf-v6-u-font-size-xs pf-v6-u-color-200 pf-v6-u-mb-0">
                            {card.description}
                          </Content>
                        </StackItem>
                      </Stack>
                    </CardBody>
                  </Card>
                </GridItem>
              ))}
            </Grid>
          </CardBody>
        </CardExpandableContent>
      </Card>
    </PageSection>
  );
};

export default EnableYourTeamSection;
