import {InfoIcon} from 'lucide-react';
import {ReactNode} from 'react';
import {Tooltip, TooltipContent, TooltipTrigger} from '@/components/ui/tooltip';

const InfoTooltip = ({content}: {content: ReactNode}) => {
  return (
    <Tooltip>
      <TooltipTrigger className="inline-flex items-center">
        <InfoIcon className="h-4 w-4 text-gray-500 hover:text-gray-700 transition-colors" />
      </TooltipTrigger>
      <TooltipContent className="max-w-xs">
        <p className="text-sm">{content}</p>
      </TooltipContent>
    </Tooltip>
  );
};

export default InfoTooltip;
