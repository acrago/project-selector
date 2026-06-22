import * as React from 'react';
import { Bullseye, Button, Card, CardBody, CardHeader, Content, Flex, FlexItem, Grid, GridItem, Modal, ModalBody, ModalFooter, ModalVariant, PageSection, Stack, StackItem } from '@patternfly/react-core';
import { TimesIcon } from '@patternfly/react-icons';
import '@patternfly/react-styles/css/utilities/Spacing/spacing.css';
import '@patternfly/react-styles/css/utilities/Display/display.css';
import '@patternfly/react-styles/css/utilities/Flex/flex.css';
import '@patternfly/react-styles/css/utilities/Sizing/sizing.css';
import GettingStartedImage from '@app/bgimages/GettingStarted.png';
import { CapabilityCard } from './CapabilityCardVariations';
import {
  buildHomeCapabilities,
  CapabilityCategory,
  categoryInfo,
  groupCapabilitiesByCategory,
} from '../homeCapabilitiesData';

const HomeCapabilitiesSimple: React.FunctionComponent = () => {
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [modalMessage, setModalMessage] = React.useState('');
  const [isGetStartedCardVisible, setIsGetStartedCardVisible] = React.useState(true);
  const categoriesToShow: CapabilityCategory[] = ['ai-hub', 'gen-ai', 'develop'];

  const getInitialCategory = (): CapabilityCategory | null => {
    const stored = localStorage.getItem('homeCapabilitiesSelectedCategory');
    if (stored === 'null' || stored === null) {
      return null;
    }
    if (stored && categoriesToShow.includes(stored as CapabilityCategory)) {
      return stored as CapabilityCategory;
    }
    return null;
  };

  const [selectedCategory, setSelectedCategory] = React.useState<CapabilityCategory | null>(
    getInitialCategory
  );

  React.useEffect(() => {
    localStorage.setItem('homeCapabilitiesSelectedCategory', selectedCategory || 'null');
  }, [selectedCategory]);

  const handleCategoryClick = (category: CapabilityCategory) => {
    setSelectedCategory(selectedCategory === category ? null : category);
  };

  const showModal = React.useCallback((message: string) => {
    setModalMessage(message);
    setIsModalOpen(true);
  }, []);

  const capabilities = React.useMemo(() => buildHomeCapabilities(showModal), [showModal]);
  const groupedCapabilities = React.useMemo(() => groupCapabilitiesByCategory(capabilities), [capabilities]);

  return (
    <>
      <PageSection variant="default" hasBodyWrapper={false} id="home-capabilities-simple">
        <Stack hasGutter>
          <StackItem>
            <Flex gap={{ default: 'gapMd' }} alignItems={{ default: 'alignItemsStretch' }}>
              {/* Get Started Card */}
              {isGetStartedCardVisible && (
                <FlexItem flex={{ default: 'flex_3' }}>
                  <Card style={{ overflow: 'hidden', height: '100%', position: 'relative' }}>
                    <CardBody className="pf-v6-u-p-0" style={{ height: '100%' }}>
                      <Button
                        variant="plain"
                        aria-label="Close Get Started card"
                        onClick={() => setIsGetStartedCardVisible(false)}
                        icon={<TimesIcon />}
                        id="close-get-started-card-button"
                        style={{ position: 'absolute', top: '0.5rem', right: '0.5rem', zIndex: 10 }}
                      />
                      <Flex alignItems={{ default: 'alignItemsStretch' }} spaceItems={{ default: 'spaceItemsXl' }} style={{ height: '100%' }}>
                        <FlexItem flex={{ default: 'flexNone' }} className="pf-v6-u-pt-md pf-v6-u-pb-md pf-v6-u-display-flex pf-v6-u-align-items-center pf-v6-u-w-25">
                          <img
                            src={GettingStartedImage}
                            alt="Getting Started Illustration"
                            className="pf-v6-u-w-100"
                          />
                        </FlexItem>
                        <FlexItem flex={{ default: 'flex_1' }} className="pf-v6-u-py-md pf-v6-u-pl-sm pf-v6-u-pr-lg pf-v6-u-display-flex pf-v6-u-align-items-center">
                          <Content component="h1">
                            Get started with OpenShift AI
                          </Content>
                        </FlexItem>
                      </Flex>
                    </CardBody>
                  </Card>
                </FlexItem>
              )}

              {/* Category Selector Cards */}
              {categoriesToShow.map((category) => (
                <FlexItem key={category} flex={{ default: 'flex_2' }}>
                  <Card
                    isClickable
                    isClicked={selectedCategory === category}
                    variant={selectedCategory === category ? 'default' : 'secondary'}
                    data-testid={`category-selector-${category}`}
                    className="pf-v6-u-h-100"
                  >
                    <Bullseye>
                      <CardHeader
                        selectableActions={{
                          onClickAction: () => handleCategoryClick(category),
                          selectableActionAriaLabelledby: `category-label-${category}`,
                        }}
                      >
                        <Flex gap={{ default: 'gapMd' }} alignItems={{ default: 'alignItemsFlexStart' }}>
                          <FlexItem>
                            <div style={{ fontSize: '24px', minWidth: '24px' }}>
                              {categoryInfo[category].icon}
                            </div>
                          </FlexItem>
                          <FlexItem flex={{ default: 'flex_1' }}>
                            <Content id={`category-label-${category}`} isEditorial>
                              {categoryInfo[category].description}
                            </Content>
                          </FlexItem>
                        </Flex>
                      </CardHeader>
                    </Bullseye>
                  </Card>
                </FlexItem>
              ))}
            </Flex>
          </StackItem>
          {selectedCategory && (
            <StackItem>
              <div data-testid={`capability-group-${selectedCategory}`}>
                <Grid hasGutter sm={6} md={4} lg={3}>
                  {groupedCapabilities[selectedCategory].map((capability) => (
                    <GridItem key={capability.title}>
                      <CapabilityCard capability={capability} layout="editorial" />
                    </GridItem>
                  ))}
                </Grid>
              </div>
            </StackItem>
          )}
        </Stack>
      </PageSection>
      <Modal
        variant={ModalVariant.small}
        title="Page Not Available"
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        id="page-not-available-modal"
      >
        <ModalBody>{modalMessage}</ModalBody>
        <ModalFooter>
          <Button key="close" variant="primary" onClick={() => setIsModalOpen(false)}>
            Close
          </Button>
        </ModalFooter>
      </Modal>
    </>
  );
};

export default HomeCapabilitiesSimple;
