import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Text,
  Section,
  Row,
  Column,
} from '@react-email/components';

export const InvitationEmailTemplate = ({
  invitationLink,
}: {
  invitationLink: string;
}) => (
  <Html lang="en">
    <Head>
      <title>Invitation to join BandsScheduler</title>
    </Head>
    <Body>
      <Container>
        <Section>
          <Row>
            <Column>
              <Heading>Invitation to join BandsScheduler</Heading>
              <Text>
                You have been invited to join Band Scheduler. Click the link
                below to sign up and get started.
              </Text>
              <Text>
                <a href={invitationLink}>Join Band Scheduler</a>
              </Text>
            </Column>
          </Row>
        </Section>
      </Container>
    </Body>
  </Html>
);
