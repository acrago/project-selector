import * as React from 'react';
import {
  Breadcrumb,
  BreadcrumbItem,
  Card,
  CardBody,
  Content,
  ContentVariants,
  Gallery,
  GalleryItem,
  PageSection,
} from '@patternfly/react-core';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const ArtifactsIcon: React.FC = () => (
  <svg width="28" height="28" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M3.86444 12.7856L14.5533 18.722C14.6283 18.7653 14.7134 18.7881 14.8 18.7881C14.8866 18.7881 14.9717 18.7653 15.0467 18.722L25.7356 12.7856C25.816 12.7406 25.883 12.675 25.9297 12.5955C25.9763 12.516 26.0009 12.4255 26.0009 12.3334C26.0009 12.2412 25.9763 12.1507 25.9297 12.0712C25.883 11.9917 25.816 11.9261 25.7356 11.8811L15.0467 5.94469C14.9707 5.90438 14.886 5.8833 14.8 5.8833C14.714 5.8833 14.6293 5.90438 14.5533 5.94469L3.86444 11.8811C3.78398 11.9261 3.71696 11.9917 3.67031 12.0712C3.62366 12.1507 3.59907 12.2412 3.59907 12.3334C3.59907 12.4255 3.62366 12.516 3.67031 12.5955C3.71696 12.675 3.78398 12.7406 3.86444 12.7856ZM14.8 6.98069L24.4282 12.3334L14.8 17.686L5.17178 12.3334L14.8 6.98069Z" fill="#151515"/>
    <path d="M25.2423 16.6337L14.8001 22.4386L4.35785 16.6337C4.239 16.5683 4.09903 16.5528 3.96874 16.5905C3.83844 16.6283 3.72849 16.7163 3.66307 16.8352C3.59765 16.954 3.58212 17.094 3.6199 17.2243C3.65768 17.3546 3.74567 17.4645 3.86451 17.5299L14.5534 23.4746C14.6302 23.5123 14.7145 23.532 14.8001 23.532C14.8856 23.532 14.97 23.5123 15.0467 23.4746L25.7356 17.5299C25.7945 17.4975 25.8464 17.4539 25.8883 17.4014C25.9303 17.349 25.9615 17.2888 25.9802 17.2243C25.9989 17.1598 26.0048 17.0922 25.9974 17.0254C25.9899 16.9587 25.9695 16.894 25.9371 16.8352C25.9047 16.7763 25.861 16.7244 25.8086 16.6825C25.7561 16.6405 25.6959 16.6093 25.6314 16.5905C25.5669 16.5718 25.4993 16.566 25.4326 16.5734C25.3658 16.5808 25.3011 16.6013 25.2423 16.6337Z" fill="#151515"/>
  </svg>
);

const BenchmarkSuiteIcon: React.FC = () => (
  <svg width="28" height="28" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M23.0222 20.0459C21.5587 20.0459 20.3418 21.1148 20.0951 22.5126H13.9778C13.69 22.5126 13.468 22.7428 13.468 23.0223C13.468 23.3019 13.6982 23.5321 13.9778 23.5321H20.0951C20.3418 24.9299 21.5587 25.9988 23.0222 25.9988C24.6667 25.9988 25.9987 24.6586 25.9987 23.0223C25.9987 21.3861 24.6585 20.0459 23.0222 20.0459ZM23.0222 24.9792C21.9451 24.9792 21.0654 24.0995 21.0654 23.0223C21.0654 21.9452 21.9451 21.0655 23.0222 21.0655C24.0994 21.0655 24.9791 21.9452 24.9791 23.0223C24.9791 24.0995 24.0994 24.9792 23.0222 24.9792Z" fill="#151515"/>
    <path d="M6.57776 9.5626C8.04132 9.5626 9.25821 8.49371 9.50487 7.09593H17.6695L16.9049 7.8606C16.7075 8.05793 16.7075 8.38682 16.9049 8.58415C17.0035 8.68282 17.1351 8.73215 17.2667 8.73215C17.3982 8.73215 17.5298 8.68282 17.6284 8.58415L19.2729 6.93971C19.2729 6.93971 19.2811 6.92326 19.2893 6.91504C19.3222 6.87393 19.3633 6.82459 19.3798 6.77526C19.4291 6.65193 19.4291 6.50393 19.3798 6.3806C19.3551 6.33126 19.3222 6.28193 19.2893 6.24082C19.2893 6.2326 19.2811 6.22437 19.2729 6.21615L17.6284 4.57171C17.4311 4.37437 17.1022 4.37437 16.9049 4.57171C16.7075 4.76904 16.7075 5.09793 16.9049 5.29526L17.6695 6.05993H9.50487C9.25821 4.66215 8.04132 3.59326 6.57776 3.59326C4.93332 3.59326 3.60132 4.93348 3.60132 6.56971C3.60132 8.20593 4.94154 9.54615 6.57776 9.54615V9.5626ZM6.57776 4.62926C7.65487 4.62926 8.53465 5.50904 8.53465 6.58615C8.53465 7.66326 7.65487 8.54304 6.57776 8.54304C5.50065 8.54304 4.62087 7.66326 4.62087 6.58615C4.62087 5.50904 5.50065 4.62926 6.57776 4.62926Z" fill="#151515"/>
    <path d="M8.22221 15.3179H11.8729C12.1195 16.7157 13.3364 17.7846 14.8 17.7846C16.2635 17.7846 17.4804 16.7157 17.7271 15.3179H21.3778C23.9267 15.3179 25.9987 13.2459 25.9987 10.6971C25.9987 8.14817 23.9267 6.07617 21.3778 6.07617C21.09 6.07617 20.868 6.30639 20.868 6.58595C20.868 6.86551 21.0982 7.09573 21.3778 7.09573C23.3593 7.09573 24.9791 8.70728 24.9791 10.6971C24.9791 12.6868 23.3675 14.2984 21.3778 14.2984H17.7271C17.4804 12.9006 16.2635 11.8317 14.8 11.8317C13.3364 11.8317 12.1195 12.9006 11.8729 14.2984H8.22221C5.67332 14.2984 3.60132 16.3704 3.60132 18.9193C3.60132 21.4682 5.67332 23.5402 8.22221 23.5402H10.2695L9.50487 24.3048C9.30754 24.5022 9.30754 24.8311 9.50487 25.0284C9.60354 25.1271 9.7351 25.1764 9.86665 25.1764C9.99821 25.1764 10.1298 25.1271 10.2284 25.0284L11.8729 23.384C11.8729 23.384 11.8811 23.3675 11.8893 23.3593C11.9222 23.3182 11.9633 23.2688 11.9798 23.2195C12.0291 23.0962 12.0291 22.9482 11.9798 22.8248C11.9551 22.7755 11.9222 22.7262 11.8893 22.6851C11.8893 22.6768 11.8811 22.6686 11.8729 22.6604L10.2284 21.0159C10.0311 20.8186 9.70221 20.8186 9.50487 21.0159C9.30754 21.2133 9.30754 21.5422 9.50487 21.7395L10.2695 22.5042H8.22221C6.24065 22.5042 4.62087 20.8926 4.62087 18.9028C4.62087 16.9131 6.23243 15.3015 8.22221 15.3015V15.3179ZM14.8 12.8513C15.8771 12.8513 16.7569 13.7311 16.7569 14.8082C16.7569 15.8853 15.8771 16.7651 14.8 16.7651C13.7229 16.7651 12.8431 15.8853 12.8431 14.8082C12.8431 13.7311 13.7229 12.8513 14.8 12.8513Z" fill="#151515"/>
  </svg>
);

interface EvaluationType {
  id: string;
  title: string;
  description: string;
  icon: React.FC;
  path: string;
  iconBackground: string;
}

const evaluationTypes: EvaluationType[] = [
  {
    id: 'benchmark',
    title: 'Single benchmark',
    description: 'Select a standalone benchmark to evaluate specific model or agent performance metrics.',
    icon: ArtifactsIcon,
    path: '/develop-train/evaluations/benchmarks',
    iconBackground: '#ECE6FF',
  },
  {
    id: 'collection',
    title: 'Benchmark suite',
    description: 'Select a predefined group of benchmarks that aligns with your industry or use case.',
    icon: BenchmarkSuiteIcon,
    path: '/develop-train/evaluations/collections',
    iconBackground: '#E0F5F5',
  },
];

const NewEvaluation: React.FunctionComponent = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const evaluationContext = location.state as { evaluationName?: string; endpoint?: string; offlineUri?: string } | null;

  return (
    <>
      <PageSection hasBodyWrapper={false}>
        <Breadcrumb id="new-evaluation-breadcrumb">
          <BreadcrumbItem>
            <Link to="/develop-train/evaluations">Evaluation</Link>
          </BreadcrumbItem>
          <BreadcrumbItem isActive>New Evaluation</BreadcrumbItem>
        </Breadcrumb>
      </PageSection>
      <PageSection hasBodyWrapper={false} style={{ paddingBottom: '8px', columnGap: 0, rowGap: 0 }}>
        <Content component={ContentVariants.h1} style={{ marginBottom: '4px' }}>Select evaluation type</Content>
        <Content component={ContentVariants.p}>
          Select the type of evaluation to run: a single benchmark or a benchmark suite.
        </Content>
      </PageSection>
      <PageSection hasBodyWrapper={false}>
        <Gallery hasGutter minWidths={{ default: '100%', md: '48%' }} maxWidths={{ default: '100%', md: '48%' }}>
          {evaluationTypes.map((type) => (
            <GalleryItem key={type.id}>
              <Card
                id={`evaluation-type-${type.id}`}
                isClickable
                onClick={() => navigate(type.path, { state: evaluationContext })}
                style={{
                  cursor: 'pointer',
                  borderRadius: '16px',
                  border: '1px solid #d2d2d2',
                  transition: 'border-color 0.2s, box-shadow 0.2s',
                  height: '100%',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'var(--pf-t--global--color--brand--default)';
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 102, 204, 0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#d2d2d2';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <CardBody style={{ padding: '24px' }}>
                  <div style={{
                    width: '48px',
                    height: '48px',
                    backgroundColor: type.iconBackground,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '16px',
                  }}>
                    <type.icon />
                  </div>
                  <Content component={ContentVariants.h3} style={{ marginBottom: '12px', fontWeight: 600, fontSize: '18px', color: 'var(--pf-t--global--color--brand--default)' }}>
                    {type.title}
                  </Content>
                  <Content component={ContentVariants.p} style={{ color: '#151515', fontSize: '14px', lineHeight: '1.5' }}>
                    {type.description}
                  </Content>
                </CardBody>
              </Card>
            </GalleryItem>
          ))}
        </Gallery>
      </PageSection>
    </>
  );
};

export { NewEvaluation };
