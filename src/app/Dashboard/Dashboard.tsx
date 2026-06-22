import * as React from 'react';
import {
  Button,
  Flex,
  FlexItem,
  PageSection
} from '@patternfly/react-core';
import { useNavigate } from 'react-router-dom';
import { useDocumentTitle } from '@app/utils/useDocumentTitle';

const Dashboard: React.FunctionComponent = () => {
  useDocumentTitle("Dashboard");
  const navigate = useNavigate();

  return (
    <PageSection isFilled>
      <Flex 
        justifyContent={{ default: 'justifyContentCenter' }} 
        alignItems={{ default: 'alignItemsCenter' }}
        style={{ 
          height: '60vh',
          textAlign: 'center'
        }}
      >
        <FlexItem>
          <div>
            <p style={{ 
              fontSize: '1.125rem', 
              color: '#6a6e73',
              maxWidth: '600px',
              lineHeight: '1.6',
              marginBottom: '1rem'
            }}>
              The focus of this prototype is{' '}
               <Button
                 variant="link"
                 isInline
                 onClick={() => window.open(`${window.location.origin}/ai-hub/models/catalog`, '_blank')}
                 style={{ fontWeight: 'bold', fontSize: 'inherit', padding: 0 }}
               >
                 AI Hub
               </Button>
               {' '}and{' '}
               <Button
                 variant="link"
                 isInline
                 onClick={() => navigate('/ai-assets/available')}
                 style={{ fontWeight: 'bold', fontSize: 'inherit', padding: 0 }}
               >
                 Generative AI Studio
               </Button>
              .
            </p>
          </div>
        </FlexItem>
      </Flex>
    </PageSection>
  );
};

export { Dashboard };
