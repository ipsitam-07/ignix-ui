import React, { useState } from 'react';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import CodeBlock from '@theme/CodeBlock';
import useBaseUrl from '@docusaurus/useBaseUrl';
import VariantSelector from './VariantSelector';
import {
  ErrorPage,
  ErrorPageErrorCode,
  ErrorPageHeading,
  ErrorPageDesc,
  ErrorPageIllustration,
  ErrorPageContent,
  ErrorPageSearch,
  ErrorPageFooter,
  ErrorPageLinks,
  ErrorPageIcons,
  ErrorPageErrorReference,
} from '@site/src/components/UI/error-page';
import { ButtonWithIcon } from '@site/src/components/UI/button-with-icon';
import { Home, ArrowLeft, RefreshCw, Bug, MessageCircle, AlertTriangle, Wrench, Zap, Rocket, Settings, ShieldAlert } from 'lucide-react';

type ErrorPageVariant = 'default' | 'minimal' | 'gradient' | 'dark' | 'server' | 'forbidden';
type AnimationType = 'none' | 'pulse' | 'bounce' | 'glow' | 'shake' | 'rotate';
type IllustrationPosition = 'left' | 'right' | 'topCenter';
type ErrorType = '404' | '500' | '403';

const variants: ErrorPageVariant[] = ['default', 'minimal', 'gradient', 'dark', 'server', 'forbidden'];
const errorTypes: ErrorType[] = ['404', '500', '403'];

const animationTypes: AnimationType[] = ['none', 'pulse', 'bounce', 'glow', 'shake', 'rotate'];

const illustrationPositions: IllustrationPosition[] = ['left', 'right', 'topCenter'];

const ErrorPageDemo = () => {
  const [errorType, setErrorType] = useState<ErrorType>('404');
  const [variant, setVariant] = useState<ErrorPageVariant>('default');
  const [animationType, setAnimationType] = useState<AnimationType>('none');
  const [illustrationPosition, setIllustrationPosition] = useState<IllustrationPosition>('topCenter');
  const [showSearch, setShowSearch] = useState<boolean>(true);
  const [showIllustration, setShowIllustration] = useState<boolean>(false);
  const [showBackgroundImage, setShowBackgroundImage] = useState<boolean>(false);

  const img404 = useBaseUrl('/img/404-1.svg');
  const img500 = useBaseUrl('/img/500-1.svg');
  const customBg = "https://images.unsplash.com/photo-1557683316-973673baf926?w=1600&h=900&fit=crop&q=90";
  const errorReferenceId = React.useMemo(() => {
    return `ERR-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
  }, []);

  const handleCopyReferenceId = (referenceId: string) => {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(referenceId).then(() => {
        alert(`Error Reference ID copied: ${referenceId}`);
      }).catch(() => {
        alert(`Error Reference ID copied: ${referenceId}`);
      });
    } else {
      alert(`Error Reference ID copied: ${referenceId}`);
    }
  };

  // Tuple format: [iconComponent, colorClass] (custom colors per icon) for 500 errors
  const icons: [typeof AlertTriangle, typeof Wrench, typeof Zap, typeof Rocket] = [
    AlertTriangle,
    Wrench,
    Zap,
    Rocket,
  ];

  const generateCodeString = () => {
    let code = `import {
    ErrorPage,
    ErrorPageErrorCode,
    ErrorPageHeading,
    ErrorPageDesc,
    ErrorPageIllustration,
    ErrorPageContent,
    ErrorPageSearch,
    ErrorPageFooter,
    ErrorPageLinks,
    ErrorPageIcons,
    ErrorPageErrorReference,
  } from '@ignix-ui/errorpage';\n`
    code += `import { ButtonWithIcon } from '@ignix-ui/buttonwithicon';\n`
    code += `\n<ErrorPage\n  variant="${variant}"\n  icon={${errorType === '403' ? 'ShieldAlert' : 'Settings'}}${showBackgroundImage ? `\n  backgroundImage="${customBg}"` : ''}\n>`;

    if (showIllustration && errorType === '404') {
      code += `\n  <ErrorPageIllustration\n    position="${illustrationPosition}"\n    illustration="/img/404-1.svg"\n    className="w-90 h-90 mx-auto"\n  />`;
    } else if (showIllustration && errorType === '500') {
      code += `\n  <ErrorPageIllustration\n    position="${illustrationPosition}"\n    illustration="/img/500-1.svg"\n    className="w-90 h-90 mx-auto"\n  />`;
    } else if (showIllustration && errorType === '403') {
      code += `\n  <ErrorPageIllustration\n    position="${illustrationPosition}"\n    illustration="/img/403-1.png"\n    className="w-90 h-90 mx-auto"\n  />`;
    }

    code += `\n  <ErrorPageContent>`;

    if (!showIllustration) {
      code += `\n    <ErrorPageIcons\n      icons={[AlertTriangle, Wrench, Zap, Rocket]}\n    >`;
      code += `\n      <ErrorPageErrorCode\n        errorCode="${errorType}"\n        animationType="${errorType === '500' || errorType === '403' ? 'glow' : animationType}"\n      />`;
      code += `\n    </ErrorPageIcons>`;
    }

    if (errorType === '500') {
      code += `\n    <ErrorPageHeading>Server Error</ErrorPageHeading>`;
      code += `\n    <ErrorPageDesc>\n      We apologize for the inconvenience. Something unexpected happened on our server.\n      Our technical team has been automatically notified and is investigating the issue.\n    </ErrorPageDesc>`;
      code += `\n    <ErrorPageErrorReference\n      errorReferenceId="${errorReferenceId}"\n      onCopy={handleCopyReferenceId}\n    />`;
      code += `\n    <ErrorPageLinks>`;
      code += `\n      <ButtonWithIcon\n        variant="default"\n        size="lg"\n        icon={<RefreshCw/>}\n        iconPosition="left"\n      >\n        Retry\n      </ButtonWithIcon>`;
      code += `\n      <ButtonWithIcon\n        variant="default"\n        size="lg"\n        icon={<Bug/>}\n        iconPosition="left"\n      >\n        Report a Bug\n      </ButtonWithIcon>`;
      code += `\n      <ButtonWithIcon\n        variant="default"\n        size="lg"\n        icon={<MessageCircle/>}\n        iconPosition="left"\n      >\n        Contact Support\n      </ButtonWithIcon>`;
      code += `\n    </ErrorPageLinks>`;
    } else if (errorType === '403') {
      code += `\n    <ErrorPageHeading>Access Restricted</ErrorPageHeading>`;
      code += `\n    <ErrorPageDesc>\n      You don't have permission to access this resource. Please contact your administrator \n      if you believe this is an error.\n    </ErrorPageDesc>`;
      code += `\n    <ErrorPageErrorReference\n      errorReferenceId="${errorReferenceId}"\n      onCopy={handleCopyReferenceId}\n    />`;
      code += `\n    <ErrorPageLinks>`;
      code += `\n      <ButtonWithIcon\n        variant="default"\n        size="lg"\n        icon={<ArrowLeft/>}\n        iconPosition="left"\n        onClick={() => window.history.back()}\n      >\n        Go back\n      </ButtonWithIcon>`;
      code += `\n      <ButtonWithIcon\n        variant="outline"\n        size="lg"\n        icon={<MessageCircle/>}\n        iconPosition="left"\n      >\n        Request Access\n      </ButtonWithIcon>`;
      code += `\n    </ErrorPageLinks>`;
    } else {
      code += `\n    <ErrorPageHeading>Page Not Found</ErrorPageHeading>`;
      code += `\n    <ErrorPageDesc>\n      The page you're looking for doesn't exist. It might have been moved, deleted, or the URL might be incorrect.\n    </ErrorPageDesc>`;

      if (showSearch) {
        code += `\n    <ErrorPageSearch\n      showSearch={true}\n      searchPlaceholder="Search for something else..."\n    />`;
      }

      code += `\n    <ErrorPageLinks>`;
      code += `\n      <ButtonWithIcon\n        variant="default"\n        size="lg"\n        icon={<ArrowLeft/>}\n        iconPosition="left"\n        onClick={() => window.history.back()}\n      >\n        Go back\n      </ButtonWithIcon>`;
      code += `\n      <ButtonWithIcon\n        variant="default"\n        size="lg"\n        icon={<Home/>}\n        iconPosition="left"\n        onClick={() => (window.location.href = "/")}\n      >\n        Take me home\n      </ButtonWithIcon>`;
      code += `\n    </ErrorPageLinks>`;
    }

    code += `\n  </ErrorPageContent>`;
    code += `\n  <ErrorPageFooter>`;
    code += `\n    ${errorType === '500' ? `ERROR 500 · SERVER ERROR · REF: ${errorReferenceId}` : errorType === '403' ? `ERROR 403 · ACCESS DENIED · REF: ${errorReferenceId}` : 'ERROR 404 · PAGE NOT FOUND'}`;
    code += `\n  </ErrorPageFooter>`;
    code += `\n</ErrorPage>`;

    return code;
  };

  return (
    <div className="space-y-6 mb-8">
      <div className="flex flex-wrap gap-4 justify-start sm:justify-end">
        <VariantSelector
          variants={[...errorTypes]}
          selectedVariant={errorType}
          onSelectVariant={(v) => setErrorType(v as ErrorType)}
          type="Error Type"
        />
        {!showBackgroundImage && <VariantSelector
          variants={[...variants]}
          selectedVariant={variant}
          onSelectVariant={(v) => setVariant(v as ErrorPageVariant)}
          type="Variant"
        />}
        {!showIllustration && (
          <VariantSelector
            variants={[...animationTypes]}
            selectedVariant={animationType}
            onSelectVariant={(v) => setAnimationType(v as AnimationType)}
            type="Error Code Animation"
          />
        )}
        {showIllustration && (
          <VariantSelector
            variants={[...illustrationPositions]}
            selectedVariant={illustrationPosition}
            onSelectVariant={(v) => setIllustrationPosition(v as IllustrationPosition)}
            type="Illustration Position"
          />
        )}
        <div className="flex items-center gap-2">
          {errorType === '404' && (
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showSearch}
                onChange={(e) => setShowSearch(e.target.checked)}
                className="rounded"
              />
              <span className="text-sm">Show Search</span>
            </label>
          )}
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={showIllustration}
              onChange={(e) => setShowIllustration(e.target.checked)}
              className="rounded"
            />
            <span className="text-sm">Show Illustration</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={showBackgroundImage}
              onChange={(e) => setShowBackgroundImage(e.target.checked)}
              className="rounded"
            />
            <span className="text-sm">Background Image</span>
          </label>
        </div>
      </div>

      <Tabs>
        <TabItem value="preview" label="Preview">
          <div className="border border-gray-300 rounded-lg overflow-hidden">
            <div className="p-3">
              <ErrorPage
                variant={variant}
                icon={errorType === '403' ? ShieldAlert : Settings}
                className="min-h-0"
                {...(showBackgroundImage && {
                  backgroundImage: customBg,
                })}
              >
                {showIllustration && errorType === '404' && (
                  <ErrorPageIllustration
                    position={illustrationPosition}
                    illustration={img404}
                    className="w-90 h-90 mx-auto"
                  />
                )}
                {showIllustration && errorType === '500' && (
                  <ErrorPageIllustration
                    position={illustrationPosition}
                    illustration={img500}
                    className="w-90 h-90 mx-auto"
                  />
                )}
                {showIllustration && errorType === '403' && (
                  <ErrorPageIllustration
                    position={illustrationPosition}
                    illustration={img500}
                    className="w-90 h-90 mx-auto"
                  />
                )}
                <ErrorPageContent>
                  {!showIllustration && (
                    <ErrorPageIcons
                      icons={icons}
                    >
                      <ErrorPageErrorCode
                        errorCode={errorType}
                        animationType={animationType}
                      />
                    </ErrorPageIcons>)
                  }
                  {errorType === '500' ? (
                    <>
                      <ErrorPageHeading>Server Error</ErrorPageHeading>
                      <ErrorPageDesc>
                        We apologize for the inconvenience. Something unexpected happened on our server.
                        Our technical team has been automatically notified and is investigating the issue.
                      </ErrorPageDesc>
                      <ErrorPageErrorReference
                        errorReferenceId={errorReferenceId}
                        onCopy={handleCopyReferenceId}
                      />
                      <ErrorPageLinks>
                        <ButtonWithIcon
                          variant="default"
                          size="lg"
                          icon={<RefreshCw />}
                          iconPosition="left"
                        >
                          Retry
                        </ButtonWithIcon>
                        <ButtonWithIcon
                          variant="default"
                          size="lg"
                          icon={<Bug />}
                          iconPosition="left"
                        >
                          Report a Bug
                        </ButtonWithIcon>
                        <ButtonWithIcon
                          variant="default"
                          size="lg"
                          icon={<MessageCircle />}
                          iconPosition="left"
                        >
                          Contact Support
                        </ButtonWithIcon>
                      </ErrorPageLinks>
                    </>
                  ) : errorType === '403' ? (
                    <>
                      <ErrorPageHeading>Access Restricted</ErrorPageHeading>
                      <ErrorPageDesc>
                        You don't have permission to access this resource. Please contact your administrator
                        if you believe this is an error.
                      </ErrorPageDesc>
                      <ErrorPageErrorReference
                        errorReferenceId={errorReferenceId}
                        onCopy={handleCopyReferenceId}
                      />
                      <ErrorPageLinks>
                        <ButtonWithIcon
                          variant="default"
                          size="lg"
                          icon={<ArrowLeft />}
                          iconPosition="left"
                          onClick={() => window.history.back()}
                        >
                          Go back
                        </ButtonWithIcon>
                        <ButtonWithIcon
                          variant="outline"
                          size="lg"
                          icon={<MessageCircle />}
                          iconPosition="left"
                        >
                          Request Access
                        </ButtonWithIcon>
                      </ErrorPageLinks>
                    </>
                  ) : (
                    <>

                      <ErrorPageHeading>Page Not Found</ErrorPageHeading>
                      <ErrorPageDesc>
                        The page you're looking for doesn't exist. It might have been moved, deleted, or the URL might be incorrect.
                      </ErrorPageDesc>
                      {showSearch && (
                        <ErrorPageSearch
                          showSearch={true}
                          searchPlaceholder="Search for something else..."
                        />
                      )}
                      <ErrorPageLinks>
                        <ButtonWithIcon
                          variant="default"
                          size="lg"
                          icon={<ArrowLeft />}
                          iconPosition="left"
                          onClick={() => window.history.back()}
                        >
                          Go back
                        </ButtonWithIcon>
                        <ButtonWithIcon
                          variant="default"
                          size="lg"
                          icon={<Home />}
                          iconPosition="left"
                          onClick={() => (window.location.href = "/")}
                        >
                          Take me home
                        </ButtonWithIcon>
                      </ErrorPageLinks>
                    </>
                  )}
                </ErrorPageContent>
                <ErrorPageFooter>
                  {errorType === '500'
                    ? `ERROR 500 · SERVER ERROR · REF: ${errorReferenceId}`
                    : errorType === '403'
                      ? `ERROR 403 · ACCESS DENIED · REF: ${errorReferenceId}`
                      : 'ERROR 404 · PAGE NOT FOUND'
                  }
                </ErrorPageFooter>
              </ErrorPage>
            </div>
          </div>
        </TabItem>
        <TabItem value="code" label="Code">
          <CodeBlock language="tsx" className="whitespace-pre-wrap max-h-[500px] overflow-y-scroll">
            {generateCodeString()}
          </CodeBlock>
        </TabItem>
      </Tabs>
    </div>
  );
};

const CustomDesignDemo = () => {
  const astronautGif = useBaseUrl('/img/error-astranaut.gif');
  return (
    <div className="space-y-6 mb-8">
      <div>
        <Tabs>
          <TabItem value="custom-preview" label="Preview">
            <div className="border border-gray-300 rounded-lg">
              <ErrorPage variant="default" className="bg-slate-950 relative overflow-hidden min-h-0">
                {/* Space background with stars */}
                <div className="absolute inset-0 bg-slate-950">
                  {Array.from({ length: 100 }).map((_, i) => (
                    <div
                      key={i}
                      className="absolute rounded-full bg-white"
                      style={{
                        left: `${Math.random() * 100}%`,
                        top: `${Math.random() * 100}%`,
                        width: `${Math.random() * 2 + 1}px`,
                        height: `${Math.random() * 2 + 1}px`,
                        opacity: Math.random() * 0.8 + 0.2,
                      }}
                    />
                  ))}
                </div>

                {/* Content */}
                <ErrorPageContent>
                  {/* Error Code */}
                  <ErrorPageErrorCode
                    errorCode="404"
                    animationType="bounce"
                    className="text-center text-8xl sm:text-9xl lg:text-[12rem] font-bold text-primary mb-6 tracking-tight [text-shadow:0_0_20px_rgba(75,85,99,0.6),0_0_40px_rgba(75,85,99,0.35)] [filter:drop-shadow(0_10px_25px_rgba(0,0,0,0.3))]"
                  />

                  {/* Illustration - Astronaut GIF */}
                  <ErrorPageIllustration
                    illustration={astronautGif}
                    className="w-64 h-64 mx-auto"
                  />

                  {/* Heading */}
                  <ErrorPageHeading
                    title="Lost in space?"
                    className="text-white text-center text-4xl sm:text-5xl lg:text-6xl font-bold mb-4"
                  />

                  {/* Description */}
                  <ErrorPageDesc
                    description="The page you're looking for drifted off into the void. Let's get you back on course."
                    className="text-center text-slate-300 mb-8 leading-relaxed text-lg"
                  />

                  {/* Search */}
                  <ErrorPageSearch
                    showSearch={true}
                    searchPlaceholder="Search for something else..."
                  />

                  {/* Navigation Links */}
                  <ErrorPageLinks>
                    <ButtonWithIcon
                      variant="default"
                      size="lg"
                      icon={<ArrowLeft />}
                      iconPosition="left"
                      onClick={() => window.history.back()}
                    >
                      Go back
                    </ButtonWithIcon>
                    <ButtonWithIcon
                      variant="default"
                      size="lg"
                      icon={<Home />}
                      iconPosition="left"
                      onClick={() => (window.location.href = "/")}
                    >
                      Take me home
                    </ButtonWithIcon>
                  </ErrorPageLinks>
                </ErrorPageContent>

                {/* Footer */}
                <ErrorPageFooter>
                  <p className="text-sm text-slate-400">ERROR 404 • PAGE NOT FOUND</p>
                </ErrorPageFooter>
              </ErrorPage>
            </div>
          </TabItem>
          <TabItem value="custom-code" label="Code">
            <CodeBlock language="tsx" className="whitespace-pre-wrap max-h-[500px] overflow-y-scroll">
              {`import {
    ErrorPage,
    ErrorPageErrorCode,
    ErrorPageHeading,
    ErrorPageDesc,
    ErrorPageIllustration,
    ErrorPageContent,
    ErrorPageSearch,
    ErrorPageFooter,
    ErrorPageLinks,
    ErrorPageIcons,
    ErrorPageErrorReference,
  } from '@ignix-ui/errorpage';\n
import { ButtonWithIcon } from '@ignix-ui/buttonwithicon';\n
<ErrorPage variant="default" className="bg-slate-950 relative overflow-hidden">
  {/* Space background with stars */}
  <div className="absolute inset-0 bg-slate-950">
    {Array.from({ length: 100 }).map((_, i) => (
      <div
        key={i}
        className="absolute rounded-full bg-white"
        style={{
          left: \`\${Math.random() * 100}%\`,
          top: \`\${Math.random() * 100}%\`,
          width: \`\${Math.random() * 2 + 1}px\`,
          height: \`\${Math.random() * 2 + 1}px\`,
          opacity: Math.random() * 0.8 + 0.2,
        }}
      />
    ))}
  </div>
  
  {/* Content */}
  <ErrorPageContent>
    {/* Error Code */}
    <ErrorPageErrorCode
      errorCode="404"
      animationType="bounce"
      className="text-center text-8xl sm:text-9xl lg:text-[12rem] font-bold text-primary mb-6 tracking-tight [text-shadow:0_0_20px_rgba(75,85,99,0.6),0_0_40px_rgba(75,85,99,0.35)] [filter:drop-shadow(0_10px_25px_rgba(0,0,0,0.3))]"
    />
    
    {/* Illustration - Astronaut GIF */}
    <ErrorPageIllustration
      illustration="/ignix-ui/img/error-astranaut.gif"
      className="w-64 h-64 mx-auto"
    />
    
    {/* Heading */}
    <ErrorPageHeading
      title="Lost in space?"
      className="text-white text-center text-4xl sm:text-5xl lg:text-6xl font-bold mb-4"
    />
    
    {/* Description */}
    <ErrorPageDesc
      description="The page you're looking for drifted off into the void. Let's get you back on course."
      className="text-center text-slate-300 mb-8 leading-relaxed text-lg"
    />
    
    {/* Search */}
    <ErrorPageSearch
      showSearch={true}
      searchPlaceholder="Search for something else..."
    />
    
    {/* Navigation Links */}
    <ErrorPageLinks>
      <ButtonWithIcon
        variant="default"
        size="lg"
        icon={<ArrowLeft/>}
        iconPosition="left"
        onClick={() => window.history.back()}
      >
        Go back
      </ButtonWithIcon>
      <ButtonWithIcon
        variant="default"
        size="lg"
        icon={<Home/>}
        iconPosition="left"
        onClick={() => (window.location.href = "/")}
      >
        Take me home
      </ButtonWithIcon>
    </ErrorPageLinks>
  </ErrorPageContent>
  
  {/* Footer */}
  <ErrorPageFooter>
    <p className="text-sm text-slate-400">ERROR 404 • PAGE NOT FOUND</p>
  </ErrorPageFooter>
</ErrorPage>`}
            </CodeBlock>
          </TabItem>
        </Tabs>
      </div>
    </div>
  );
};

export { ErrorPageDemo, CustomDesignDemo };

